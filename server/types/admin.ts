// Database entity interfaces based on database_structure.sql

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
  // Joined category information
  category_name?: string;
}

export interface ProductWithCategory extends Omit<Product, 'category_name'> {
  category_name: string | null;
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
    products: ProductWithCategory[];
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
    product: ProductWithCategory;
  };
}

export interface AdminUpdateProductResponse {
  success: boolean;
  message: string;
  data?: {
    product: ProductWithCategory;
  };
}

// Request query interfaces for filtering and pagination
export interface ProductsQueryParams {
  search?: string;
  category?: string;
  status?: 'all' | 'active' | 'out_of_stock' | 'low_stock';
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'price' | 'stock' | 'created_at';
  sortOrder?: 'asc' | 'desc';
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

// Order status enum
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
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
    case OrderStatus.PROCESSING:
      return 'Processing';
    case OrderStatus.SHIPPED:
      return 'Shipped';
    case OrderStatus.DELIVERED:
      return 'Delivered';
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
    case OrderStatus.PROCESSING:
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case OrderStatus.SHIPPED:
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case OrderStatus.DELIVERED:
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
      return OrderStatus.PROCESSING;
    case OrderStatus.PROCESSING:
      return OrderStatus.SHIPPED;
    case OrderStatus.SHIPPED:
      return OrderStatus.DELIVERED;
    default:
      return null;
  }
};

export const canUpdateOrderStatus = (currentStatus: OrderStatus, newStatus: OrderStatus): boolean => {
  // Define valid status transitions
  const validTransitions: { [key in OrderStatus]: OrderStatus[] } = {
    [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
    [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
    [OrderStatus.DELIVERED]: [], // Final state
    [OrderStatus.CANCELLED]: [] // Final state
  };

  return validTransitions[currentStatus].includes(newStatus);
};

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
