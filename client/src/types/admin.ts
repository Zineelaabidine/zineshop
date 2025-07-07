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
