import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  CreditCard,
  ArrowLeft,
  Download
} from 'lucide-react';
import { formatPrice } from '../utils/cartUtils';

interface OrderData {
  orderId: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  codFee?: number;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    image?: string;
  }>;
  shippingAddress: {
    fullName: string;
    phone: string;
    email: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  deliveryMethod: {
    name: string;
    estimatedDays: string;
  };
  paymentMethod: string;
  createdAt: string;
  estimatedDelivery: string;
}

const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to get order data from navigation state first
    if (location.state?.orderData) {
      setOrderData(location.state.orderData);
      setIsLoading(false);
    } else if (orderId) {
      // Fetch order data from API
      fetchOrderData(orderId);
    } else {
      setError('Order ID not found');
      setIsLoading(false);
    }
  }, [orderId, location.state]);

  const fetchOrderData = async (id: string) => {
    try {
      const response = await fetch(`/api/orders/${id}`);
      const result = await response.json();

      if (result.success) {
        setOrderData(result.data);
      } else {
        setError(result.message || 'Order not found');
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
      setError('Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-100 mb-2">Order Not Found</h2>
          <p className="text-gray-400 mb-6">{error || 'The order you are looking for does not exist.'}</p>
          <Link
            to="/products"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Order Confirmed!</h1>
          <p className="text-gray-400">Thank you for your purchase. Your order has been received and is being processed.</p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-100">Order #{orderData.orderNumber || orderData.orderId}</h2>
              <p className="text-gray-400">Placed on {new Date(orderData.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                <CheckCircle className="w-4 h-4 mr-1" />
                {orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Order Items */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Items Ordered</h3>
            <div className="space-y-4">
              {orderData.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-gray-100 font-medium">{item.name}</h4>
                    <p className="text-gray-400 text-sm">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-gray-100 font-semibold">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Totals */}
          <div className="border-t border-gray-700 pt-6 mt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal</span>
                <span>{formatPrice(orderData.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Shipping</span>
                <span>{orderData.shippingCost === 0 ? 'Free' : formatPrice(orderData.shippingCost)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Tax</span>
                <span>{formatPrice(orderData.taxAmount)}</span>
              </div>
              {orderData.codFee && orderData.codFee > 0 && (
                <div className="flex justify-between text-gray-300">
                  <span>Cash on Delivery Fee</span>
                  <span>{formatPrice(orderData.codFee)}</span>
                </div>
              )}
              <div className="border-t border-gray-700 pt-2">
                <div className="flex justify-between text-lg font-bold text-gray-100">
                  <span>Total</span>
                  <span>{formatPrice(orderData.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery and Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Shipping Information */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Truck className="w-5 h-5 text-blue-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-100">Shipping Information</h3>
            </div>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                <div>
                  <p className="font-medium">{orderData.shippingAddress.fullName}</p>
                  <p>{orderData.shippingAddress.addressLine1}</p>
                  {orderData.shippingAddress.addressLine2 && (
                    <p>{orderData.shippingAddress.addressLine2}</p>
                  )}
                  <p>
                    {orderData.shippingAddress.city}, {orderData.shippingAddress.state} {orderData.shippingAddress.postalCode}
                  </p>
                  <p>{orderData.shippingAddress.country}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                <span>{orderData.shippingAddress.phone}</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                <span>{orderData.shippingAddress.email}</span>
              </div>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Calendar className="w-5 h-5 text-blue-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-100">Delivery Details</h3>
            </div>
            <div className="space-y-3 text-gray-300">
              <div>
                <p className="font-medium">{orderData.deliveryMethod.name}</p>
                <p className="text-sm text-gray-400">{orderData.deliveryMethod.estimatedDays}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Estimated Delivery</p>
                <p className="font-medium">{new Date(orderData.estimatedDelivery).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center">
                <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                <span className="capitalize">{orderData.paymentMethod.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/products"
            className="flex items-center justify-center px-6 py-3 bg-gray-700 text-gray-100 rounded-lg hover:bg-gray-600 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Link>
          
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Print Receipt
          </button>
        </div>

        {/* Email Confirmation Notice */}
        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center">
            <Mail className="w-5 h-5 text-blue-400 mr-3" />
            <div>
              <p className="text-blue-400 font-medium">Confirmation Email Sent</p>
              <p className="text-blue-300 text-sm">
                A confirmation email has been sent to {orderData.shippingAddress.email} with your order details and tracking information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
