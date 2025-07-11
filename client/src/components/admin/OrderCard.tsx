import React, { useState } from 'react';
import { 
  Package, 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  DollarSign, 
  ChevronDown, 
  ChevronUp,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { 
  AdminOrder, 
  OrderStatus, 
  formatCurrency, 
  formatDate, 
  getNextOrderStatus,
  canUpdateOrderStatus 
} from '../../types/admin';
import OrderStatusBadge from './OrderStatusBadge';

interface OrderCardProps {
  order: AdminOrder;
  onStatusUpdate: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  isUpdating?: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onStatusUpdate, isUpdating = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const nextStatus = getNextOrderStatus(order.status);
  const canAdvanceStatus = nextStatus && canUpdateOrderStatus(order.status, nextStatus);

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (isUpdatingStatus || !canUpdateOrderStatus(order.status, newStatus)) return;

    try {
      setIsUpdatingStatus(true);
      await onStatusUpdate(order.id, newStatus);
    } catch (error) {
      console.error('Failed to update order status:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusUpdateButton = () => {
    if (!canAdvanceStatus) return null;

    return (
      <button
        onClick={() => handleStatusUpdate(nextStatus)}
        disabled={isUpdatingStatus || isUpdating}
        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors"
      >
        {isUpdatingStatus ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ArrowRight className="w-4 h-4" />
        )}
        Mark as {nextStatus?.charAt(0).toUpperCase() + nextStatus?.slice(1)}
      </button>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Order #{order.orderNumber}
              </h3>
              <p className="text-sm text-gray-600">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <OrderStatusBadge status={order.status} />
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Customer</p>
              <p className="font-medium text-gray-900">{order.customerName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-900">{order.customerEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="font-medium text-gray-900">{formatCurrency(order.total)}</p>
            </div>
          </div>
        </div>

        {/* Status Update Button */}
        <div className="mt-4 flex justify-end">
          {getStatusUpdateButton()}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Items */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Order Items</h4>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <p className="font-medium text-gray-900">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Payment Info */}
            <div className="space-y-6">
              {/* Shipping Address */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Shipping Address
                </h4>
                <div className="p-3 bg-white rounded-lg">
                  <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
                  <p className="text-sm text-gray-600">{order.shippingAddress.phone}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {order.shippingAddress.addressLine1}
                    {order.shippingAddress.addressLine2 && (
                      <>, {order.shippingAddress.addressLine2}</>
                    )}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </p>
                  <p className="text-sm text-gray-600">{order.shippingAddress.country}</p>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Order Summary</h4>
                <div className="p-3 bg-white rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="text-gray-900">{formatCurrency(order.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax:</span>
                    <span className="text-gray-900">{formatCurrency(order.taxAmount)}</span>
                  </div>
                  {order.codFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">COD Fee:</span>
                      <span className="text-gray-900">{formatCurrency(order.codFee)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-gray-900">{formatCurrency(order.total)}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    Payment: {order.paymentMethod.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
