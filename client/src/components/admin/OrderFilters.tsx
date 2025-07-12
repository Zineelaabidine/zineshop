import React from 'react';
import { Search, Filter } from 'lucide-react';
import { OrderStatus, getOrderStatusText } from '../../types/admin';

interface OrderFiltersProps {
  currentStatus: 'all' | OrderStatus;
  onStatusChange: (status: 'all' | OrderStatus) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  className?: string;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({
  currentStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
  className = ''
}) => {
  const statusOptions: Array<{ value: 'all' | OrderStatus; label: string }> = [
    { value: 'all', label: 'All Orders' },
    { value: OrderStatus.PENDING, label: getOrderStatusText(OrderStatus.PENDING) },
    { value: OrderStatus.PAID, label: getOrderStatusText(OrderStatus.PAID) },
    { value: OrderStatus.SHIPPED, label: getOrderStatusText(OrderStatus.SHIPPED) },
    { value: OrderStatus.CANCELLED, label: getOrderStatusText(OrderStatus.CANCELLED) }
  ];

  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by customer email or order ID..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="lg:w-48">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={currentStatus}
              onChange={(e) => onStatusChange(e.target.value as 'all' | OrderStatus)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white appearance-none"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderFilters;
