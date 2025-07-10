/**
 * Cart Utility Functions
 * 
 * Helper functions for cart operations, localStorage management, and calculations
 */

import { CartItem, CartState, CART_STORAGE_KEY, CART_TIMESTAMP_KEY, CART_CONFIG, CartError, CART_ERROR_CODES } from '../types/cart';

/**
 * Generate unique ID for cart items
 */
export const generateCartItemId = (productId: string, variants?: Record<string, string>): string => {
  const variantString = variants ? JSON.stringify(variants) : '';
  return `${productId}_${btoa(variantString)}_${Date.now()}`;
};

/**
 * Create a unique key for identifying similar items (same product + variants)
 */
export const createItemKey = (productId: string, variants?: Record<string, string>): string => {
  const variantString = variants ? JSON.stringify(Object.entries(variants).sort()) : '';
  return `${productId}_${btoa(variantString)}`;
};

/**
 * Calculate cart totals
 */
export const calculateCartTotals = (items: CartItem[]): { totalItems: number; totalPrice: number } => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  return { totalItems, totalPrice };
};

/**
 * Validate cart item data
 */
export const validateCartItem = (item: Partial<CartItem>): void => {
  if (!item.productId) {
    throw new CartError('Product ID is required', CART_ERROR_CODES.INVALID_QUANTITY);
  }
  
  if (!item.name) {
    throw new CartError('Product name is required', CART_ERROR_CODES.INVALID_QUANTITY);
  }
  
  if (typeof item.price !== 'number' || item.price < 0) {
    throw new CartError('Valid price is required', CART_ERROR_CODES.INVALID_QUANTITY);
  }
  
  if (typeof item.quantity !== 'number' || item.quantity < 1) {
    throw new CartError('Quantity must be at least 1', CART_ERROR_CODES.INVALID_QUANTITY);
  }
  
  if (item.quantity > CART_CONFIG.MAX_QUANTITY_PER_ITEM) {
    throw new CartError(
      `Quantity cannot exceed ${CART_CONFIG.MAX_QUANTITY_PER_ITEM}`,
      CART_ERROR_CODES.INVALID_QUANTITY
    );
  }
  
  if (typeof item.maxStock === 'number' && item.quantity > item.maxStock) {
    throw new CartError(
      `Quantity cannot exceed available stock (${item.maxStock})`,
      CART_ERROR_CODES.INSUFFICIENT_STOCK
    );
  }
};

/**
 * Save cart to localStorage
 */
export const saveCartToStorage = (cartState: CartState): void => {
  try {
    const cartData = {
      items: cartState.items,
      lastUpdated: new Date().toISOString(),
    };
    
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
    localStorage.setItem(CART_TIMESTAMP_KEY, cartData.lastUpdated);
  } catch (error) {
    console.error('Failed to save cart to localStorage:', error);
    throw new CartError('Failed to save cart', CART_ERROR_CODES.STORAGE_ERROR, error);
  }
};

/**
 * Load cart from localStorage
 */
export const loadCartFromStorage = (): CartItem[] => {
  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    const timestamp = localStorage.getItem(CART_TIMESTAMP_KEY);
    
    if (!cartData) {
      return [];
    }
    
    // Check if cart has expired
    if (timestamp) {
      const lastUpdated = new Date(timestamp);
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() - CART_CONFIG.EXPIRY_DAYS);
      
      if (lastUpdated < expiryDate) {
        // Cart has expired, clear it
        clearCartFromStorage();
        return [];
      }
    }
    
    const parsed = JSON.parse(cartData);
    return Array.isArray(parsed.items) ? parsed.items : [];
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error);
    // Clear corrupted data
    clearCartFromStorage();
    return [];
  }
};

/**
 * Clear cart from localStorage
 */
export const clearCartFromStorage = (): void => {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem(CART_TIMESTAMP_KEY);
  } catch (error) {
    console.error('Failed to clear cart from localStorage:', error);
  }
};

/**
 * Format price for display
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

/**
 * Format quantity for display
 */
export const formatQuantity = (quantity: number): string => {
  return quantity.toLocaleString();
};

/**
 * Check if two variant objects are equal
 */
export const areVariantsEqual = (
  variants1?: Record<string, string>,
  variants2?: Record<string, string>
): boolean => {
  if (!variants1 && !variants2) return true;
  if (!variants1 || !variants2) return false;
  
  const keys1 = Object.keys(variants1).sort();
  const keys2 = Object.keys(variants2).sort();
  
  if (keys1.length !== keys2.length) return false;
  
  return keys1.every(key => variants1[key] === variants2[key]);
};

/**
 * Find cart item by product ID and variants
 */
export const findCartItem = (
  items: CartItem[],
  productId: string,
  variants?: Record<string, string>
): CartItem | undefined => {
  return items.find(item => 
    item.productId === productId && areVariantsEqual(item.variants, variants)
  );
};

/**
 * Get total quantity for a specific product (across all variants)
 */
export const getProductTotalQuantity = (items: CartItem[], productId: string): number => {
  return items
    .filter(item => item.productId === productId)
    .reduce((total, item) => total + item.quantity, 0);
};

/**
 * Validate cart against stock limits
 */
export const validateCartStock = (items: CartItem[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  for (const item of items) {
    if (item.quantity > item.maxStock) {
      errors.push(`${item.name}: Requested quantity (${item.quantity}) exceeds available stock (${item.maxStock})`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Create a summary of cart contents for analytics or checkout
 */
export const createCartSummary = (items: CartItem[]) => {
  const { totalItems, totalPrice } = calculateCartTotals(items);
  
  return {
    totalItems,
    totalPrice,
    uniqueProducts: items.length,
    categories: [...new Set(items.map(item => item.category).filter(Boolean))],
    averageItemPrice: items.length > 0 ? totalPrice / totalItems : 0,
    items: items.map(item => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
      variants: item.variants
    }))
  };
};
