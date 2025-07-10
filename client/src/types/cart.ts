/**
 * Cart Types and Interfaces
 * 
 * Defines all TypeScript interfaces and types for the shopping cart system
 */

export interface CartItem {
  /** Unique identifier for the cart item */
  id: string;
  
  /** Product ID from the database */
  productId: string;
  
  /** Product name */
  name: string;
  
  /** Product price per unit */
  price: number;
  
  /** Quantity selected by user */
  quantity: number;
  
  /** Product image URL */
  image: string | null;
  
  /** Maximum stock available */
  maxStock: number;
  
  /** Selected product variants (size, color, etc.) */
  variants?: Record<string, string>;
  
  /** When the item was added to cart */
  addedAt: string;
  
  /** Category name for organization */
  category?: string | null;
}

export interface CartState {
  /** Array of items in the cart */
  items: CartItem[];
  
  /** Total number of items in cart */
  totalItems: number;
  
  /** Total price of all items */
  totalPrice: number;
  
  /** Whether cart is currently loading */
  isLoading: boolean;
  
  /** Last updated timestamp */
  lastUpdated: string;
}

export interface CartActions {
  /** Add item to cart or increase quantity if exists */
  addItem: (item: Omit<CartItem, 'id' | 'addedAt'>) => void;
  
  /** Remove item completely from cart */
  removeItem: (itemId: string) => void;
  
  /** Update quantity of specific item */
  updateQuantity: (itemId: string, quantity: number) => void;
  
  /** Clear all items from cart */
  clearCart: () => void;
  
  /** Get specific item from cart */
  getItem: (productId: string, variants?: Record<string, string>) => CartItem | undefined;
  
  /** Check if product is in cart */
  isInCart: (productId: string, variants?: Record<string, string>) => boolean;
  
  /** Get total quantity for a specific product */
  getProductQuantity: (productId: string) => number;
}

export interface CartContextType extends CartState, CartActions {}

export interface AddToCartData {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  maxStock: number;
  variants?: Record<string, string>;
  category?: string | null;
}

/**
 * Local Storage Keys
 */
export const CART_STORAGE_KEY = 'zineshop_cart';
export const CART_TIMESTAMP_KEY = 'zineshop_cart_timestamp';

/**
 * Cart Configuration
 */
export const CART_CONFIG = {
  /** Maximum number of items allowed in cart */
  MAX_ITEMS: 100,
  
  /** Maximum quantity per item */
  MAX_QUANTITY_PER_ITEM: 99,
  
  /** Cart expiry time in days */
  EXPIRY_DAYS: 30,
  
  /** Auto-save debounce delay in milliseconds */
  AUTO_SAVE_DELAY: 500,
} as const;

/**
 * Cart Event Types for custom events
 */
export enum CartEventType {
  ITEM_ADDED = 'cart:item_added',
  ITEM_REMOVED = 'cart:item_removed',
  ITEM_UPDATED = 'cart:item_updated',
  CART_CLEARED = 'cart:cleared',
  CART_LOADED = 'cart:loaded',
}

/**
 * Cart Error Types
 */
export class CartError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'CartError';
  }
}

export const CART_ERROR_CODES = {
  ITEM_NOT_FOUND: 'ITEM_NOT_FOUND',
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  INVALID_QUANTITY: 'INVALID_QUANTITY',
  CART_FULL: 'CART_FULL',
  STORAGE_ERROR: 'STORAGE_ERROR',
} as const;
