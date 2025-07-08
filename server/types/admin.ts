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

export interface ProductWithCategory extends Product {
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

// Frontend-specific interfaces (for client-side)
export interface AdminPageData {
  products: ProductWithCategory[];
  categories: Category[];
  stats: AdminStats;
  isLoading: boolean;
  error: string | null;
}
