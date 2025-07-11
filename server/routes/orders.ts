import express, { Request, Response } from 'express';
import { query } from '../config/database';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  name: string;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface CreateOrderRequest {
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  deliveryMethodId: string;
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  codFee?: number;
  total: number;
  orderNotes?: string;
  customerEmail: string;
}

/**
 * POST /api/orders
 * Create a new order
 */
// Option 1: Required Authentication (current implementation)
// router.post('/', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
//   const userId = req.user!.id; // Required - user must be authenticated

// Option 2: Optional Authentication (supports guest checkout)
router.post('/', optionalAuth, asyncHandler(async (req: Request, res: Response) => {
  try {
    const orderData: CreateOrderRequest = req.body;
    const userId = req.user?.id || null; // Optional - supports guest checkout

    // Validate required fields
    if (!orderData.items || orderData.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    if (!orderData.shippingAddress || !orderData.customerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address and email are required'
      });
    }

    // Start transaction
    await query('BEGIN');

    try {
      // 1. Create shipping address
      const addressResult = await query(
        `INSERT INTO addresses (user_id, type, full_name, phone, address_line_1, address_line_2, city, state, postal_code, country)
         VALUES ($1, 'shipping', $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [
          userId,
          orderData.shippingAddress.fullName,
          orderData.shippingAddress.phone,
          orderData.shippingAddress.addressLine1,
          orderData.shippingAddress.addressLine2 || null,
          orderData.shippingAddress.city,
          orderData.shippingAddress.state,
          orderData.shippingAddress.postalCode,
          orderData.shippingAddress.country
        ]
      );

      const shippingAddressId = addressResult.rows[0].id;

      // 2. Create order
      const orderResult = await query(
        `INSERT INTO orders (
          user_id, shipping_address_id, billing_address_id, delivery_method_id,
          subtotal, shipping_cost, tax_amount, cod_fee, total, status, payment_method,
          order_notes, customer_email
        ) VALUES ($1, $2, $2, $3, $4, $5, $6, $7, $8, 'pending', $9, $10, $11)
        RETURNING id`,
        [
          userId,
          shippingAddressId,
          orderData.deliveryMethodId,
          orderData.subtotal,
          orderData.shippingCost,
          orderData.taxAmount,
          orderData.codFee || 0,
          orderData.total,
          orderData.paymentMethod,
          orderData.orderNotes || null,
          orderData.customerEmail
        ]
      );

      const orderId = orderResult.rows[0].id;

      // 3. Create order items
      for (const item of orderData.items) {
        await query(
          'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
          [orderId, item.productId, item.quantity, item.unitPrice]
        );

        // Update product stock
        await query(
          'UPDATE products SET stock = stock - $1 WHERE id = $2',
          [item.quantity, item.productId]
        );
      }

      // 4. Create payment record
      await query(
        `INSERT INTO payments (order_id, amount, provider, status, payment_method)
         VALUES ($1, $2, $3, 'initiated', $4)`,
        [orderId, orderData.total, orderData.paymentMethod, orderData.paymentMethod]
      );

      // Commit transaction
      await query('COMMIT');

      // Get delivery method for response
      const deliveryResult = await query(
        'SELECT name, estimated_days FROM delivery_methods WHERE id = $1',
        [orderData.deliveryMethodId]
      );

      const deliveryMethod = deliveryResult.rows[0];

      // Calculate estimated delivery date
      const estimatedDelivery = new Date();
      const days = parseInt(deliveryMethod.estimated_days.split('-')[1] || '7');
      estimatedDelivery.setDate(estimatedDelivery.getDate() + days);

      // Return order confirmation
      return res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: {
          orderId,
          orderNumber: orderId.substring(0, 8).toUpperCase(),
          status: 'pending',
          total: orderData.total,
          subtotal: orderData.subtotal,
          shippingCost: orderData.shippingCost,
          taxAmount: orderData.taxAmount,
          codFee: orderData.codFee || 0,
          items: orderData.items,
          shippingAddress: orderData.shippingAddress,
          deliveryMethod: {
            name: deliveryMethod.name,
            estimatedDays: deliveryMethod.estimated_days
          },
          paymentMethod: orderData.paymentMethod,
          createdAt: new Date().toISOString(),
          estimatedDelivery: estimatedDelivery.toISOString()
        }
      });

    } catch (error) {
      // Rollback transaction on error
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
}));

/**
 * GET /api/orders/:id
 * Get order details by ID
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get order with related data
    const orderResult = await query(
      `SELECT 
        o.*,
        a.full_name, a.phone, a.address_line_1, a.address_line_2,
        a.city, a.state, a.postal_code, a.country,
        dm.name as delivery_name, dm.estimated_days
       FROM orders o
       LEFT JOIN addresses a ON o.shipping_address_id = a.id
       LEFT JOIN delivery_methods dm ON o.delivery_method_id = dm.id
       WHERE o.id = $1`,
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = orderResult.rows[0];

    // Get order items
    const itemsResult = await query(
      `SELECT oi.*, p.name, p.image_url
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [id]
    );

    // Calculate estimated delivery
    const estimatedDelivery = new Date(order.created_at);
    const days = parseInt(order.estimated_days?.split('-')[1] || '7');
    estimatedDelivery.setDate(estimatedDelivery.getDate() + days);

    return res.json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.id.substring(0, 8).toUpperCase(),
        status: order.status,
        total: parseFloat(order.total),
        subtotal: parseFloat(order.subtotal),
        shippingCost: parseFloat(order.shipping_cost),
        taxAmount: parseFloat(order.tax_amount),
        codFee: parseFloat(order.cod_fee || '0'),
        items: itemsResult.rows.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: parseFloat(item.unit_price),
          image: item.image_url
        })),
        shippingAddress: {
          fullName: order.full_name,
          phone: order.phone,
          email: order.customer_email,
          addressLine1: order.address_line_1,
          addressLine2: order.address_line_2,
          city: order.city,
          state: order.state,
          postalCode: order.postal_code,
          country: order.country
        },
        deliveryMethod: {
          name: order.delivery_name,
          estimatedDays: order.estimated_days
        },
        paymentMethod: order.payment_method,
        createdAt: order.created_at,
        estimatedDelivery: estimatedDelivery.toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
}));

export default router;
