// Client-side types for admin functionality
// These mirror the server-side types but are optimized for frontend use

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  stock: number;
  category_id: string | null;
  created_at: string;
  updated_at: string;
  category_name?: string | null;
}

export interface AdminStats {
  totalProducts: number;
  totalValue: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalCategories: number;
  totalUsers: number;
  totalOrders: number;
}

// API Response interfaces
export interface AdminProductsResponse {
  success: boolean;
  message?: string;
  data?: {
    products: Product[];
    totalCount: number;
  };
}

export interface AdminCategoriesResponse {
  success: boolean;
  message?: string;
  data?: {
    categories: Category[];
  };
}

export interface AdminStatsResponse {
  success: boolean;
  message?: string;
  data?: AdminStats;
}

export interface AdminDeleteProductResponse {
  success: boolean;
  message: string;
  data?: {
    deletedProductId: string;
    deletedProductName: string;
  };
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category_id: string;
  image_url?: string;
}

export interface UpdateProductRequest {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category_id: string;
  image_url?: string;
}

export interface AdminCreateProductResponse {
  success: boolean;
  message: string;
  data?: {
    product: Product;
  };
}

export interface AdminUpdateProductResponse {
  success: boolean;
  message: string;
  data?: {
    product: Product;
  };
}

// Product status enum
export enum ProductStatus {
  ACTIVE = 'active',
  OUT_OF_STOCK = 'out_of_stock',
  LOW_STOCK = 'low_stock'
}

// Helper function to determine product status
export const getProductStatus = (stock: number): ProductStatus => {
  if (stock === 0) return ProductStatus.OUT_OF_STOCK;
  if (stock < 10) return ProductStatus.LOW_STOCK;
  return ProductStatus.ACTIVE;
};

// Helper function to get status badge classes
export const getStatusBadgeClasses = (stock: number): string => {
  const status = getProductStatus(stock);
  switch (status) {
    case ProductStatus.ACTIVE:
      return 'bg-green-100 text-green-800';
    case ProductStatus.OUT_OF_STOCK:
      return 'bg-red-100 text-red-800';
    case ProductStatus.LOW_STOCK:
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Helper function to get status text
export const getStatusText = (stock: number): string => {
  const status = getProductStatus(stock);
  switch (status) {
    case ProductStatus.ACTIVE:
      return 'ACTIVE';
    case ProductStatus.OUT_OF_STOCK:
      return 'OUT OF STOCK';
    case ProductStatus.LOW_STOCK:
      return 'LOW STOCK';
    default:
      return 'UNKNOWN';
  }
};

// Helper function to get stock status color classes
export const getStockStatusClasses = (stock: number): string => {
  if (stock === 0) return 'text-red-600';
  if (stock < 10) return 'text-yellow-600';
  return 'text-green-600';
};

// Query parameters for filtering
export interface ProductFilters {
  search: string;
  category: string;
  status: string;
}

// Loading and error state interfaces
export interface AdminPageState {
  products: Product[];
  categories: Category[];
  stats: AdminStats | null;
  isLoadingProducts: boolean;
  isLoadingCategories: boolean;
  isLoadingStats: boolean;
  error: string | null;
  filters: ProductFilters;
}

// ===============================================
// ORDER MANAGEMENT TYPES
// ===============================================

// Order item interface
export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string;
}

// Shipping address interface
export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Delivery method interface
export interface DeliveryMethod {
  name: string;
  estimatedDays: string;
}

// Order interface
export interface AdminOrder {
  id: string;
  orderNumber: string;
  userId?: string;
  customerEmail: string;
  customerName: string;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  codFee: number;
  total: number;
  paymentMethod: string;
  orderNotes?: string;
  createdAt: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  deliveryMethod: DeliveryMethod;
}

// Order status enum (matches database schema)
export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  SHIPPED = 'shipped',
  CANCELLED = 'cancelled'
}

// Order statistics interface
export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersLast30Days: number;
}

// API Response interfaces for orders
export interface AdminOrdersResponse {
  success: boolean;
  message: string;
  data: {
    orders: AdminOrder[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalOrders: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      limit: number;
    };
  };
}

export interface AdminOrderStatsResponse {
  success: boolean;
  message: string;
  data: OrderStats;
}

export interface AdminOrderStatusUpdateResponse {
  success: boolean;
  message: string;
  data: {
    orderId: string;
    orderNumber: string;
    status: OrderStatus;
    customerEmail: string;
    total: number;
    createdAt: string;
    updatedAt: string;
  };
}

// Request interfaces
export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export interface OrdersQueryParams {
  search?: string;
  status?: 'all' | OrderStatus;
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'total' | 'status' | 'customer_email';
  sortOrder?: 'asc' | 'desc';
}

// Helper functions for order status
export const getOrderStatusText = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.PENDING:
      return 'Pending';
    case OrderStatus.PAID:
      return 'Paid';
    case OrderStatus.SHIPPED:
      return 'Shipped';
    case OrderStatus.CANCELLED:
      return 'Cancelled';
    default:
      return 'Unknown';
  }
};

export const getOrderStatusBadgeClasses = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case OrderStatus.PAID:
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case OrderStatus.SHIPPED:
      return 'bg-green-100 text-green-800 border-green-200';
    case OrderStatus.CANCELLED:
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getNextOrderStatus = (currentStatus: OrderStatus): OrderStatus | null => {
  switch (currentStatus) {
    case OrderStatus.PENDING:
      return OrderStatus.PAID;
    case OrderStatus.PAID:
      return OrderStatus.SHIPPED;
    default:
      return null; // shipped and cancelled are final states
  }
};

export const canUpdateOrderStatus = (currentStatus: OrderStatus, newStatus: OrderStatus): boolean => {
  // Define valid status transitions based on your database schema
  const validTransitions: { [key in OrderStatus]: OrderStatus[] } = {
    [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
    [OrderStatus.PAID]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    [OrderStatus.SHIPPED]: [], // Final state - product delivered
    [OrderStatus.CANCELLED]: [] // Final state
  };

  return validTransitions[currentStatus].includes(newStatus);
};

// Frontend-specific interfaces
export interface AdminOrdersPageState {
  orders: AdminOrder[];
  orderStats: OrderStats | null;
  isLoading: boolean;
  isLoadingStats: boolean;
  error: string | null;
  filters: {
    search: string;
    status: 'all' | OrderStatus;
    page: number;
    limit: number;
    sortBy: 'created_at' | 'total' | 'status' | 'customer_email';
    sortOrder: 'asc' | 'desc';
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalOrders: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  } | null;
}

// Component prop interfaces
export interface OrderCardProps {
  order: AdminOrder;
  onStatusUpdate: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  isUpdating?: boolean;
}

export interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export interface OrderFiltersProps {
  currentStatus: 'all' | OrderStatus;
  onStatusChange: (status: 'all' | OrderStatus) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  className?: string;
}

// Utility functions for formatting
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString));
};

export const formatOrderNumber = (orderId: string): string => {
  return orderId.substring(0, 8).toUpperCase();
};
