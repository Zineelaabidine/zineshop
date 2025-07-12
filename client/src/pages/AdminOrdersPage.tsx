import React, { useState, useEffect } from 'react';
import {
  Package,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  AdminOrder,
  OrderStatus,
  OrderStats,
  AdminOrdersPageState,
  formatCurrency
} from '../types/admin';
import OrderCard from '../components/admin/OrderCard';
import OrderFilters from '../components/admin/OrderFilters';
import { api } from '../config/api';

const AdminOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [state, setState] = useState<AdminOrdersPageState>({
    orders: [],
    orderStats: null,
    isLoading: true,
    isLoadingStats: true,
    error: null,
    filters: {
      search: '',
      status: 'all',
      page: 1,
      limit: 20,
      sortBy: 'created_at',
      sortOrder: 'desc'
    },
    pagination: null
  });

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const params = new URLSearchParams();
      if (state.filters.search) params.append('search', state.filters.search);
      if (state.filters.status !== 'all') params.append('status', state.filters.status);
      params.append('page', state.filters.page.toString());
      params.append('limit', state.filters.limit.toString());
      params.append('sortBy', state.filters.sortBy);
      params.append('sortOrder', state.filters.sortOrder);

      const response = await api.get(`api/admin/orders?${params}`);
      const data = await response.json();

      if (data.success) {
        setState(prev => ({
          ...prev,
          orders: data.data.orders,
          pagination: data.data.pagination,
          isLoading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: data.message || 'Failed to fetch orders',
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setState(prev => ({
        ...prev,
        error: 'Network error. Please check your connection.',
        isLoading: false
      }));
    }
  };

  // Fetch order statistics
  const fetchOrderStats = async () => {
    try {
      setState(prev => ({ ...prev, isLoadingStats: true }));

      const response = await api.get('api/admin/orders/stats');
      const data = await response.json();

      if (data.success) {
        setState(prev => ({
          ...prev,
          orderStats: data.data,
          isLoadingStats: false
        }));
      } else {
        setState(prev => ({ ...prev, isLoadingStats: false }));
      }
    } catch (error) {
      console.error('Error fetching order stats:', error);
      setState(prev => ({ ...prev, isLoadingStats: false }));
    }
  };

  // Update order status
  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const response = await api.put(`api/admin/orders/${orderId}/status`, { status: newStatus });
      const data = await response.json();

      if (data.success) {
        // Update the order in the state
        setState(prev => ({
          ...prev,
          orders: prev.orders.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        }));

        // Refresh stats
        fetchOrderStats();
      } else {
        throw new Error(data.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof typeof state.filters, value: any) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [key]: value,
        page: key !== 'page' ? 1 : value // Reset page when other filters change
      }
    }));
  };

  // Load data on component mount and filter changes
  useEffect(() => {
    fetchOrders();
  }, [state.filters]);

  useEffect(() => {
    fetchOrderStats();
  }, []);

  // Stats cards data
  const statsCards = [
    {
      title: 'Total Orders',
      value: state.orderStats?.totalOrders || 0,
      icon: Package,
      color: 'indigo' as const
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(state.orderStats?.totalRevenue || 0),
      icon: DollarSign,
      color: 'green' as const
    },
    {
      title: 'Pending Orders',
      value: state.orderStats?.pendingOrders || 0,
      icon: ShoppingCart,
      color: 'yellow' as const
    },
    {
      title: 'Avg Order Value',
      value: formatCurrency(state.orderStats?.averageOrderValue || 0),
      icon: TrendingUp,
      color: 'purple' as const
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      indigo: 'bg-indigo-100 text-indigo-600',
      green: 'bg-green-100 text-green-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      purple: 'bg-purple-100 text-purple-600'
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div>
      {/* Action Bar */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => {
            fetchOrders();
            fetchOrderStats();
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
          Refresh
        </button>
      </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  {state.isLoadingStats ? (
                    <div className="flex items-center">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <p className="text-3xl font-bold text-gray-900">
                      {typeof stat.value === 'string' ? stat.value : stat.value.toLocaleString()}
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <OrderFilters
          currentStatus={state.filters.status}
          onStatusChange={(status) => handleFilterChange('status', status)}
          searchQuery={state.filters.search}
          onSearchChange={(search) => handleFilterChange('search', search)}
          className="mb-8"
        />

        {/* Orders List */}
        <div className="space-y-6">
          {state.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto" />
                <p className="text-gray-600">Loading orders...</p>
              </div>
            </div>
          ) : state.error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="text-lg font-semibold text-red-900">Error Loading Orders</h3>
                  <p className="text-red-700">{state.error}</p>
                </div>
              </div>
            </div>
          ) : state.orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
              <p className="text-gray-600">
                {state.filters.search || state.filters.status !== 'all'
                  ? 'Try adjusting your filters to see more orders.'
                  : 'No orders have been placed yet.'}
              </p>
            </div>
          ) : (
            <>
              {state.orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))}

              {/* Pagination */}
              {state.pagination && state.pagination.totalPages > 1 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Showing {((state.pagination.currentPage - 1) * state.pagination.limit) + 1} to{' '}
                      {Math.min(state.pagination.currentPage * state.pagination.limit, state.pagination.totalOrders)} of{' '}
                      {state.pagination.totalOrders} orders
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleFilterChange('page', state.filters.page - 1)}
                        disabled={!state.pagination.hasPrevPage}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="px-4 py-2 text-sm font-medium text-gray-900">
                        Page {state.pagination.currentPage} of {state.pagination.totalPages}
                      </span>
                      <button
                        onClick={() => handleFilterChange('page', state.filters.page + 1)}
                        disabled={!state.pagination.hasNextPage}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
    </div>
  );
};

export default AdminOrdersPage;
