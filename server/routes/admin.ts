import express, { Request, Response } from 'express';
import { query } from '../config/database';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import {
  AdminProductsResponse,
  AdminCategoriesResponse,
  AdminStatsResponse,
  AdminDeleteProductResponse,
  AdminCreateProductResponse,
  AdminUpdateProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ProductsQueryParams,
  ProductWithCategory,
  Category,
  AdminStats,
  getProductStatus
} from '../types/admin';

const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// @route   GET /api/admin/products
// @desc    Get all products with filtering and pagination
// @access  Private (Admin only)
router.get('/products', asyncHandler(async (req: Request, res: Response<AdminProductsResponse>) => {
  const {
    search = '',
    category = 'all',
    status = 'all',
    page = 1,
    limit = 50,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = req.query as Partial<ProductsQueryParams>;

  // Build WHERE clause for filtering
  let whereConditions: string[] = [];
  let queryParams: any[] = [];
  let paramIndex = 1;

  // Search filter
  if (search && search.trim() !== '') {
    whereConditions.push(`(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`);
    queryParams.push(`%${search.trim()}%`);
    paramIndex++;
  }

  // Category filter
  if (category && category !== 'all') {
    whereConditions.push(`c.name = $${paramIndex}`);
    queryParams.push(category);
    paramIndex++;
  }

  // Status filter (based on stock levels)
  if (status && status !== 'all') {
    switch (status) {
      case 'out_of_stock':
        whereConditions.push('p.stock = 0');
        break;
      case 'low_stock':
        whereConditions.push('p.stock > 0 AND p.stock < 10');
        break;
      case 'active':
        whereConditions.push('p.stock >= 10');
        break;
    }
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  // Build ORDER BY clause
  const validSortFields = ['name', 'price', 'stock', 'created_at'];
  const sortField = validSortFields.includes(sortBy as string) ? sortBy : 'created_at';
  const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';
  const orderClause = `ORDER BY p.${sortField} ${sortDirection}`;

  // Calculate pagination
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit))); // Max 100 items per page
  const offset = (pageNum - 1) * limitNum;

  // Main query to get products with category information
  const productsQuery = `
    SELECT 
      p.id,
      p.name,
      p.description,
      p.price,
      p.image_url,
      p.stock,
      p.category_id,
      p.created_at,
      p.updated_at,
      c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ${whereClause}
    ${orderClause}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  queryParams.push(limitNum, offset);

  // Count query for total results
  const countQuery = `
    SELECT COUNT(*) as total
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ${whereClause}
  `;

  const countParams = queryParams.slice(0, -2); // Remove limit and offset for count query

  try {
    // Execute both queries
    const [productsResult, countResult] = await Promise.all([
      query(productsQuery, queryParams),
      query(countQuery, countParams)
    ]);

    const products: ProductWithCategory[] = productsResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      image_url: row.image_url,
      stock: parseInt(row.stock),
      category_id: row.category_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      category_name: row.category_name
    }));

    const totalCount = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products,
        totalCount
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
}));

// @route   GET /api/admin/categories
// @desc    Get all categories
// @access  Private (Admin only)
router.get('/categories', asyncHandler(async (req: Request, res: Response<AdminCategoriesResponse>) => {
  try {
    const result = await query(
      'SELECT id, name, created_at FROM categories ORDER BY name ASC'
    );

    const categories: Category[] = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      created_at: row.created_at
    }));

    res.json({
      success: true,
      message: 'Categories retrieved successfully',
      data: {
        categories
      }
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
}));

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/stats', asyncHandler(async (req: Request, res: Response<AdminStatsResponse>) => {
  try {
    // Execute multiple queries to get dashboard statistics
    const [
      productsStatsResult,
      categoriesCountResult,
      usersCountResult,
      ordersCountResult
    ] = await Promise.all([
      // Products statistics
      query(`
        SELECT 
          COUNT(*) as total_products,
          COALESCE(SUM(price * stock), 0) as total_value,
          COUNT(CASE WHEN stock > 0 AND stock < 10 THEN 1 END) as low_stock_products,
          COUNT(CASE WHEN stock = 0 THEN 1 END) as out_of_stock_products
        FROM products
      `),
      // Categories count
      query('SELECT COUNT(*) as total FROM categories'),
      // Users count
      query('SELECT COUNT(*) as total FROM users'),
      // Orders count
      query('SELECT COUNT(*) as total FROM orders')
    ]);

    const productStats = productsStatsResult.rows[0];
    const stats: AdminStats = {
      totalProducts: parseInt(productStats.total_products),
      totalValue: parseFloat(productStats.total_value),
      lowStockProducts: parseInt(productStats.low_stock_products),
      outOfStockProducts: parseInt(productStats.out_of_stock_products),
      totalCategories: parseInt(categoriesCountResult.rows[0].total),
      totalUsers: parseInt(usersCountResult.rows[0].total),
      totalOrders: parseInt(ordersCountResult.rows[0].total)
    };

    res.json({
      success: true,
      message: 'Statistics retrieved successfully',
      data: stats
    });

  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
}));

// @route   POST /api/admin/products
// @desc    Create a new product
// @access  Private (Admin only)
router.post('/products', asyncHandler(async (req: Request, res: Response<AdminCreateProductResponse>) => {
  try {
    const { name, description, price, stock, category_id, image_url }: CreateProductRequest = req.body;

    // Validation
    const errors: string[] = [];

    // Validate required fields
    if (!name || typeof name !== 'string') {
      errors.push('Product name is required and must be a string');
    } else if (name.trim().length < 2 || name.trim().length > 100) {
      errors.push('Product name must be between 2 and 100 characters');
    }

    if (!category_id || typeof category_id !== 'string') {
      errors.push('Category is required');
    } else {
      // Validate category exists
      const categoryExists = await query('SELECT id FROM categories WHERE id = $1', [category_id]);
      if (categoryExists.rows.length === 0) {
        errors.push('Selected category does not exist');
      }
    }

    if (price === undefined || price === null || typeof price !== 'number') {
      errors.push('Price is required and must be a number');
    } else if (price < 0) {
      errors.push('Price must be a positive number');
    } else if (!/^\d+(\.\d{1,2})?$/.test(price.toString())) {
      errors.push('Price must have at most 2 decimal places');
    }

    if (stock === undefined || stock === null || typeof stock !== 'number') {
      errors.push('Stock quantity is required and must be a number');
    } else if (!Number.isInteger(stock) || stock < 0) {
      errors.push('Stock quantity must be a non-negative integer');
    }

    // Validate optional fields
    if (description && (typeof description !== 'string' || description.length > 500)) {
      errors.push('Description must be a string with maximum 500 characters');
    }

    if (image_url && typeof image_url !== 'string') {
      errors.push('Image URL must be a string');
    }

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: `Validation errors: ${errors.join(', ')}`
      });
      return;
    }

    // Check for duplicate product name
    const duplicateCheck = await query(
      'SELECT id FROM products WHERE LOWER(name) = LOWER($1)',
      [name.trim()]
    );

    if (duplicateCheck.rows.length > 0) {
      res.status(409).json({
        success: false,
        message: 'A product with this name already exists'
      });
      return;
    }

    // Create the product
    const createResult = await query(
      `INSERT INTO products (name, description, price, stock, category_id, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, description, price, stock, category_id, image_url, created_at, updated_at`,
      [
        name.trim(),
        description?.trim() || null,
        price,
        stock,
        category_id,
        image_url?.trim() || null
      ]
    );

    if (createResult.rows.length === 0) {
      res.status(500).json({
        success: false,
        message: 'Failed to create product'
      });
      return;
    }

    // Get the created product with category information
    const productWithCategory = await query(
      `SELECT
        p.id, p.name, p.description, p.price, p.stock, p.category_id, p.image_url,
        p.created_at, p.updated_at, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [createResult.rows[0].id]
    );

    const newProduct: ProductWithCategory = {
      id: productWithCategory.rows[0].id,
      name: productWithCategory.rows[0].name,
      description: productWithCategory.rows[0].description,
      price: parseFloat(productWithCategory.rows[0].price),
      image_url: productWithCategory.rows[0].image_url,
      stock: parseInt(productWithCategory.rows[0].stock),
      category_id: productWithCategory.rows[0].category_id,
      created_at: productWithCategory.rows[0].created_at,
      updated_at: productWithCategory.rows[0].updated_at,
      category_name: productWithCategory.rows[0].category_name
    };

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        product: newProduct
      }
    });

  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating product'
    });
  }
}));

// @route   PUT /api/admin/products/:id
// @desc    Update a product by ID
// @access  Private (Admin only)
router.put('/products/:id', asyncHandler(async (req: Request, res: Response<AdminUpdateProductResponse>) => {
  try {
    const productId = req.params.id;
    const { name, description, price, stock, category_id, image_url }: UpdateProductRequest = req.body;

    // Validate product ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(productId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
      return;
    }

    // Check if product exists
    const existingProductResult = await query(
      'SELECT id, name FROM products WHERE id = $1',
      [productId]
    );

    if (existingProductResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }

    // Validation
    const errors: string[] = [];

    // Validate required fields
    if (!name || typeof name !== 'string') {
      errors.push('Product name is required and must be a string');
    } else if (name.trim().length < 2 || name.trim().length > 100) {
      errors.push('Product name must be between 2 and 100 characters');
    }

    if (!category_id || typeof category_id !== 'string') {
      errors.push('Category is required');
    } else {
      // Validate category exists
      const categoryExists = await query('SELECT id FROM categories WHERE id = $1', [category_id]);
      if (categoryExists.rows.length === 0) {
        errors.push('Selected category does not exist');
      }
    }

    if (price === undefined || price === null || typeof price !== 'number') {
      errors.push('Price is required and must be a number');
    } else if (price < 0) {
      errors.push('Price must be a positive number');
    } else if (!/^\d+(\.\d{1,2})?$/.test(price.toString())) {
      errors.push('Price must have at most 2 decimal places');
    }

    if (stock === undefined || stock === null || typeof stock !== 'number') {
      errors.push('Stock quantity is required and must be a number');
    } else if (!Number.isInteger(stock) || stock < 0) {
      errors.push('Stock quantity must be a non-negative integer');
    }

    // Validate optional fields
    if (description && (typeof description !== 'string' || description.length > 500)) {
      errors.push('Description must be a string with maximum 500 characters');
    }

    if (image_url && typeof image_url !== 'string') {
      errors.push('Image URL must be a string');
    }

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: `Validation errors: ${errors.join(', ')}`
      });
      return;
    }

    // Check for duplicate product name (excluding current product)
    const duplicateCheck = await query(
      'SELECT id FROM products WHERE LOWER(name) = LOWER($1) AND id != $2',
      [name.trim(), productId]
    );

    if (duplicateCheck.rows.length > 0) {
      res.status(409).json({
        success: false,
        message: 'A product with this name already exists'
      });
      return;
    }

    // Update the product
    const updateResult = await query(
      `UPDATE products
       SET name = $1, description = $2, price = $3, stock = $4, category_id = $5, image_url = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING id, name, description, price, stock, category_id, image_url, created_at, updated_at`,
      [
        name.trim(),
        description?.trim() || null,
        price,
        stock,
        category_id,
        image_url?.trim() || null,
        productId
      ]
    );

    if (updateResult.rows.length === 0) {
      res.status(500).json({
        success: false,
        message: 'Failed to update product'
      });
      return;
    }

    // Get the updated product with category information
    const productWithCategory = await query(
      `SELECT
        p.id, p.name, p.description, p.price, p.stock, p.category_id, p.image_url,
        p.created_at, p.updated_at, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [productId]
    );

    const updatedProduct: ProductWithCategory = {
      id: productWithCategory.rows[0].id,
      name: productWithCategory.rows[0].name,
      description: productWithCategory.rows[0].description,
      price: parseFloat(productWithCategory.rows[0].price),
      image_url: productWithCategory.rows[0].image_url,
      stock: parseInt(productWithCategory.rows[0].stock),
      category_id: productWithCategory.rows[0].category_id,
      created_at: productWithCategory.rows[0].created_at,
      updated_at: productWithCategory.rows[0].updated_at,
      category_name: productWithCategory.rows[0].category_name
    };

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: {
        product: updatedProduct
      }
    });

  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating product'
    });
  }
}));

// @route   DELETE /api/admin/products/:id
// @desc    Delete a product by ID
// @access  Private (Admin only)
router.delete('/products/:id', asyncHandler(async (req: Request, res: Response<AdminDeleteProductResponse>) => {
  try {
    const productId = req.params.id;

    // Validate product ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(productId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
      return;
    }

    // First, check if the product exists and get its details
    const existingProductResult = await query(
      'SELECT id, name FROM products WHERE id = $1',
      [productId]
    );

    if (existingProductResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }

    const productToDelete = existingProductResult.rows[0];

    // Delete the product
    const deleteResult = await query(
      'DELETE FROM products WHERE id = $1 RETURNING id',
      [productId]
    );

    if (deleteResult.rows.length === 0) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete product'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: {
        deletedProductId: productToDelete.id,
        deletedProductName: productToDelete.name
      }
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting product'
    });
  }
}));

// ===============================================
// ORDER MANAGEMENT ENDPOINTS
// ===============================================

// @route   GET /api/admin/orders
// @desc    Get all orders with filtering and pagination
// @access  Private (Admin only)
router.get('/orders', asyncHandler(async (req: Request, res: Response) => {
  try {
    const {
      search = '',
      status = 'all',
      page = 1,
      limit = 50,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build WHERE clause for filtering
    let whereConditions: string[] = [];
    let queryParams: any[] = [];
    let paramIndex = 1;

    // Search filter (by customer email or order ID)
    if (search && search.toString().trim() !== '') {
      whereConditions.push(`(o.customer_email ILIKE $${paramIndex} OR o.id::text ILIKE $${paramIndex})`);
      queryParams.push(`%${search.toString().trim()}%`);
      paramIndex++;
    }

    // Status filter
    if (status && status !== 'all') {
      whereConditions.push(`o.status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    // Build WHERE clause
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Validate sort parameters
    const validSortColumns = ['created_at', 'total', 'status', 'customer_email'];
    const validSortOrders = ['asc', 'desc'];
    const safeSortBy = validSortColumns.includes(sortBy as string) ? sortBy : 'created_at';
    const safeSortOrder = validSortOrders.includes(sortOrder as string) ? sortOrder : 'desc';

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 50));
    const offset = (pageNum - 1) * limitNum;

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM orders o
      ${whereClause}
    `;
    const countResult = await query(countQuery, queryParams);
    const totalOrders = parseInt(countResult.rows[0].total);

    // Get orders with related data
    const ordersQuery = `
      SELECT
        o.id,
        o.user_id,
        o.customer_email,
        o.status,
        o.subtotal,
        o.shipping_cost,
        o.tax_amount,
        o.cod_fee,
        o.total,
        o.payment_method,
        o.order_notes,
        o.created_at,
        -- Shipping address
        sa.full_name as shipping_name,
        sa.phone as shipping_phone,
        sa.address_line_1 as shipping_address_1,
        sa.address_line_2 as shipping_address_2,
        sa.city as shipping_city,
        sa.state as shipping_state,
        sa.postal_code as shipping_postal_code,
        sa.country as shipping_country,
        -- Delivery method
        dm.name as delivery_method_name,
        dm.estimated_days,
        -- User info (if registered user)
        u.full_name as user_full_name,
        u.email as user_email
      FROM orders o
      LEFT JOIN addresses sa ON o.shipping_address_id = sa.id
      LEFT JOIN delivery_methods dm ON o.delivery_method_id = dm.id
      LEFT JOIN users u ON o.user_id = u.id
      ${whereClause}
      ORDER BY o.${safeSortBy} ${safeSortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limitNum, offset);
    const ordersResult = await query(ordersQuery, queryParams);

    // Get order items for each order
    const orderIds = ordersResult.rows.map(order => order.id);
    let orderItemsMap: { [key: string]: any[] } = {};

    if (orderIds.length > 0) {
      const itemsQuery = `
        SELECT
          oi.order_id,
          oi.quantity,
          oi.unit_price,
          p.id as product_id,
          p.name as product_name,
          p.image_url
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ANY($1)
        ORDER BY oi.order_id, p.name
      `;
      const itemsResult = await query(itemsQuery, [orderIds]);

      // Group items by order_id
      itemsResult.rows.forEach(item => {
        if (!orderItemsMap[item.order_id]) {
          orderItemsMap[item.order_id] = [];
        }
        orderItemsMap[item.order_id].push({
          productId: item.product_id,
          productName: item.product_name,
          quantity: item.quantity,
          unitPrice: parseFloat(item.unit_price),
          imageUrl: item.image_url
        });
      });
    }

    // Format orders data
    const orders = ordersResult.rows.map(order => ({
      id: order.id,
      orderNumber: order.id.substring(0, 8).toUpperCase(),
      userId: order.user_id,
      customerEmail: order.customer_email,
      customerName: order.user_full_name || order.shipping_name,
      status: order.status,
      subtotal: parseFloat(order.subtotal || '0'),
      shippingCost: parseFloat(order.shipping_cost || '0'),
      taxAmount: parseFloat(order.tax_amount || '0'),
      codFee: parseFloat(order.cod_fee || '0'),
      total: parseFloat(order.total || '0'),
      paymentMethod: order.payment_method,
      orderNotes: order.order_notes,
      createdAt: order.created_at,
      items: orderItemsMap[order.id] || [],
      shippingAddress: {
        fullName: order.shipping_name,
        phone: order.shipping_phone,
        addressLine1: order.shipping_address_1,
        addressLine2: order.shipping_address_2,
        city: order.shipping_city,
        state: order.shipping_state,
        postalCode: order.shipping_postal_code,
        country: order.shipping_country
      },
      deliveryMethod: {
        name: order.delivery_method_name,
        estimatedDays: order.estimated_days
      }
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(totalOrders / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      success: true,
      message: 'Orders retrieved successfully',
      data: {
        orders,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalOrders,
          hasNextPage,
          hasPrevPage,
          limit: limitNum
        }
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching orders'
    });
  }
}));

// @route   PUT /api/admin/orders/:id/status
// @desc    Update order status
// @access  Private (Admin only)
router.put('/orders/:id/status', asyncHandler(async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    // Validate order ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(orderId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
      return;
    }

    // Validate status
    const validStatuses = ['pending', 'paid', 'shipped', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status. Valid statuses are: ' + validStatuses.join(', ')
      });
      return;
    }

    // Check if order exists
    const existingOrderResult = await query(
      'SELECT id, status, customer_email FROM orders WHERE id = $1',
      [orderId]
    );

    if (existingOrderResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    const existingOrder = existingOrderResult.rows[0];

    // Check if status is actually changing
    if (existingOrder.status === status) {
      res.status(400).json({
        success: false,
        message: `Order is already in ${status} status`
      });
      return;
    }

    // Update order status
    const updateResult = await query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING id, status, total, created_at',
      [status, orderId]
    );

    if (updateResult.rows.length === 0) {
      res.status(500).json({
        success: false,
        message: 'Failed to update order status'
      });
      return;
    }

    const updatedOrder = updateResult.rows[0];

    res.json({
      success: true,
      message: `Order status updated to ${status} successfully`,
      data: {
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.id.substring(0, 8).toUpperCase(),
        status: updatedOrder.status,
        total: parseFloat(updatedOrder.total),
        createdAt: updatedOrder.created_at,
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating order status'
    });
  }
}));

// @route   GET /api/admin/orders/stats
// @desc    Get order statistics for admin dashboard
// @access  Private (Admin only)
router.get('/orders/stats', asyncHandler(async (req: Request, res: Response) => {
  try {
    // Get order statistics
    const statsResult = await query(`
      SELECT
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_orders,
        COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped_orders,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
        COALESCE(SUM(total), 0) as total_revenue,
        COALESCE(AVG(total), 0) as average_order_value,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as orders_last_30_days
      FROM orders
    `);

    const stats = statsResult.rows[0];

    res.json({
      success: true,
      message: 'Order statistics retrieved successfully',
      data: {
        totalOrders: parseInt(stats.total_orders),
        pendingOrders: parseInt(stats.pending_orders),
        processingOrders: parseInt(stats.processing_orders),
        shippedOrders: parseInt(stats.shipped_orders),
        deliveredOrders: parseInt(stats.delivered_orders),
        cancelledOrders: parseInt(stats.cancelled_orders),
        totalRevenue: parseFloat(stats.total_revenue),
        averageOrderValue: parseFloat(stats.average_order_value),
        ordersLast30Days: parseInt(stats.orders_last_30_days)
      }
    });

  } catch (error) {
    console.error('Error fetching order statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching order statistics'
    });
  }
}));

// ===============================================
// REVIEW MANAGEMENT ENDPOINTS
// ===============================================

// @route   GET /api/admin/reviews
// @desc    Get all reviews with filtering and pagination
// @access  Private (Admin only)
router.get('/reviews', asyncHandler(async (req: Request, res: Response) => {
  try {
    const {
      search = '',
      rating = 'all',
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build WHERE clause for filtering
    let whereConditions: string[] = [];
    let queryParams: any[] = [];
    let paramIndex = 1;

    // Search filter (by product name, user name, or review content)
    if (search && search.toString().trim() !== '') {
      whereConditions.push(`(p.name ILIKE $${paramIndex} OR u.full_name ILIKE $${paramIndex} OR pr.review ILIKE $${paramIndex})`);
      queryParams.push(`%${search.toString().trim()}%`);
      paramIndex++;
    }

    // Rating filter
    if (rating && rating !== 'all') {
      whereConditions.push(`pr.rating = $${paramIndex}`);
      queryParams.push(parseInt(rating as string));
      paramIndex++;
    }

    // Build WHERE clause
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Validate sort parameters
    const validSortColumns = ['created_at', 'rating', 'product_name', 'user_name'];
    const validSortOrders = ['asc', 'desc'];
    const safeSortBy = validSortColumns.includes(sortBy as string) ? sortBy : 'created_at';
    const safeSortOrder = validSortOrders.includes(sortOrder as string) ? sortOrder : 'desc';

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const offset = (pageNum - 1) * limitNum;

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM product_reviews pr
      LEFT JOIN products p ON pr.product_id = p.id
      LEFT JOIN users u ON pr.user_id = u.id
      ${whereClause}
    `;
    const countResult = await query(countQuery, queryParams);
    const totalReviews = parseInt(countResult.rows[0].total);

    // Get reviews with related data
    const reviewsQuery = `
      SELECT
        pr.id,
        pr.user_id,
        pr.product_id,
        pr.rating,
        pr.review,
        pr.created_at,
        pr.updated_at,
        u.full_name as user_name,
        u.email as user_email,
        p.name as product_name,
        p.image_url as product_image
      FROM product_reviews pr
      LEFT JOIN products p ON pr.product_id = p.id
      LEFT JOIN users u ON pr.user_id = u.id
      ${whereClause}
      ORDER BY pr.${safeSortBy === 'product_name' ? 'p.name' : safeSortBy === 'user_name' ? 'u.full_name' : 'pr.' + safeSortBy} ${safeSortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limitNum, offset);
    const reviewsResult = await query(reviewsQuery, queryParams);

    // Calculate pagination info
    const totalPages = Math.ceil(totalReviews / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      success: true,
      message: 'Reviews retrieved successfully',
      data: {
        reviews: reviewsResult.rows,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalReviews,
          hasNextPage,
          hasPrevPage,
          limit: limitNum
        }
      }
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching reviews'
    });
  }
}));

// @route   DELETE /api/admin/reviews/:id
// @desc    Delete a review
// @access  Private (Admin only)
router.delete('/reviews/:id', asyncHandler(async (req: Request, res: Response) => {
  try {
    const reviewId = req.params.id;

    // Validate review ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(reviewId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid review ID format'
      });
      return;
    }

    // Check if review exists
    const existingReviewResult = await query(
      'SELECT id, product_id FROM product_reviews WHERE id = $1',
      [reviewId]
    );

    if (existingReviewResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Review not found'
      });
      return;
    }

    // Delete the review
    const deleteResult = await query(
      'DELETE FROM product_reviews WHERE id = $1 RETURNING id',
      [reviewId]
    );

    if (deleteResult.rows.length === 0) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete review'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Review deleted successfully',
      data: {
        reviewId: deleteResult.rows[0].id
      }
    });

  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting review'
    });
  }
}));

// @route   GET /api/admin/reviews/stats
// @desc    Get review statistics for admin dashboard
// @access  Private (Admin only)
router.get('/reviews/stats', asyncHandler(async (req: Request, res: Response) => {
  try {
    // Get review statistics
    const statsResult = await query(`
      SELECT
        COUNT(*) as total_reviews,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star_reviews,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star_reviews,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star_reviews,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star_reviews,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star_reviews,
        COALESCE(AVG(rating), 0) as average_rating,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as reviews_last_30_days,
        COUNT(CASE WHEN review IS NOT NULL AND review != '' THEN 1 END) as reviews_with_comments
      FROM product_reviews
    `);

    const stats = statsResult.rows[0];

    res.json({
      success: true,
      message: 'Review statistics retrieved successfully',
      data: {
        totalReviews: parseInt(stats.total_reviews),
        oneStarReviews: parseInt(stats.one_star_reviews),
        twoStarReviews: parseInt(stats.two_star_reviews),
        threeStarReviews: parseInt(stats.three_star_reviews),
        fourStarReviews: parseInt(stats.four_star_reviews),
        fiveStarReviews: parseInt(stats.five_star_reviews),
        averageRating: parseFloat(stats.average_rating),
        reviewsLast30Days: parseInt(stats.reviews_last_30_days),
        reviewsWithComments: parseInt(stats.reviews_with_comments)
      }
    });

  } catch (error) {
    console.error('Error fetching review statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching review statistics'
    });
  }
}));

export default router;
