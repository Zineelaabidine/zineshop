import React from 'react';
import { OrderStatus, getOrderStatusText, getOrderStatusBadgeClasses } from '../../types/admin';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, className = '' }) => {
  const badgeClasses = getOrderStatusBadgeClasses(status);
  const statusText = getOrderStatusText(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeClasses} ${className}`}
    >
      {statusText}
    </span>
  );
};

export default OrderStatusBadge;
