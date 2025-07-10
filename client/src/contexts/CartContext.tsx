/**
 * Cart Context and Provider
 * 
 * Manages global cart state using React Context API
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { 
  CartContextType, 
  CartState, 
  CartItem, 
  AddToCartData, 
  CartEventType,
  CartError,
  CART_ERROR_CODES,
  CART_CONFIG
} from '../types/cart';
import {
  calculateCartTotals,
  saveCartToStorage,
  loadCartFromStorage,
  validateCartItem,
  generateCartItemId,
  findCartItem,
  getProductTotalQuantity
} from '../utils/cartUtils';

// Cart Action Types
type CartAction =
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_LOADING'; payload: boolean };

// Initial cart state
const initialCartState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isLoading: true,
  lastUpdated: new Date().toISOString(),
};

// Cart reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'LOAD_CART': {
      const { totalItems, totalPrice } = calculateCartTotals(action.payload);
      return {
        ...state,
        items: action.payload,
        totalItems,
        totalPrice,
        isLoading: false,
        lastUpdated: new Date().toISOString(),
      };
    }

    case 'ADD_ITEM': {
      const newItems = [...state.items, action.payload];
      const { totalItems, totalPrice } = calculateCartTotals(newItems);
      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
        lastUpdated: new Date().toISOString(),
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const { totalItems, totalPrice } = calculateCartTotals(newItems);
      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
        lastUpdated: new Date().toISOString(),
      };
    }

    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.id === action.payload.itemId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      const { totalItems, totalPrice } = calculateCartTotals(newItems);
      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
        lastUpdated: new Date().toISOString(),
      };
    }

    case 'CLEAR_CART': {
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        lastUpdated: new Date().toISOString(),
      };
    }

    case 'SET_LOADING': {
      return {
        ...state,
        isLoading: action.payload,
      };
    }

    default:
      return state;
  }
};

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart Provider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedItems = loadCartFromStorage();
        dispatch({ type: 'LOAD_CART', payload: savedItems });
        
        // Dispatch cart loaded event
        window.dispatchEvent(new CustomEvent(CartEventType.CART_LOADED, {
          detail: { items: savedItems }
        }));
      } catch (error) {
        console.error('Failed to load cart:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadCart();
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!state.isLoading) {
      try {
        saveCartToStorage(state);
      } catch (error) {
        console.error('Failed to save cart:', error);
      }
    }
  }, [state]);

  // Add item to cart
  const addItem = useCallback((itemData: AddToCartData) => {
    try {
      // Validate item data
      validateCartItem(itemData);

      // Check if cart is full
      if (state.items.length >= CART_CONFIG.MAX_ITEMS) {
        throw new CartError(
          `Cart is full. Maximum ${CART_CONFIG.MAX_ITEMS} items allowed.`,
          CART_ERROR_CODES.CART_FULL
        );
      }

      // Check if item already exists in cart
      const existingItem = findCartItem(state.items, itemData.productId, itemData.variants);

      if (existingItem) {
        // Update quantity of existing item
        const newQuantity = existingItem.quantity + itemData.quantity;
        
        // Check stock limit
        if (newQuantity > itemData.maxStock) {
          throw new CartError(
            `Cannot add more items. Stock limit: ${itemData.maxStock}`,
            CART_ERROR_CODES.INSUFFICIENT_STOCK
          );
        }

        updateQuantity(existingItem.id, newQuantity);
      } else {
        // Add new item
        const newItem: CartItem = {
          ...itemData,
          id: generateCartItemId(itemData.productId, itemData.variants),
          addedAt: new Date().toISOString(),
        };

        dispatch({ type: 'ADD_ITEM', payload: newItem });

        // Dispatch item added event
        window.dispatchEvent(new CustomEvent(CartEventType.ITEM_ADDED, {
          detail: { item: newItem }
        }));
      }
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      throw error;
    }
  }, [state.items]);

  // Remove item from cart
  const removeItem = useCallback((itemId: string) => {
    const item = state.items.find(item => item.id === itemId);
    if (item) {
      dispatch({ type: 'REMOVE_ITEM', payload: itemId });

      // Dispatch item removed event
      window.dispatchEvent(new CustomEvent(CartEventType.ITEM_REMOVED, {
        detail: { item }
      }));
    }
  }, [state.items]);

  // Update item quantity
  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    const item = state.items.find(item => item.id === itemId);
    if (!item) {
      throw new CartError('Item not found in cart', CART_ERROR_CODES.ITEM_NOT_FOUND);
    }

    // Validate quantity
    if (quantity < 1) {
      removeItem(itemId);
      return;
    }

    if (quantity > item.maxStock) {
      throw new CartError(
        `Quantity cannot exceed available stock (${item.maxStock})`,
        CART_ERROR_CODES.INSUFFICIENT_STOCK
      );
    }

    if (quantity > CART_CONFIG.MAX_QUANTITY_PER_ITEM) {
      throw new CartError(
        `Quantity cannot exceed ${CART_CONFIG.MAX_QUANTITY_PER_ITEM}`,
        CART_ERROR_CODES.INVALID_QUANTITY
      );
    }

    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } });

    // Dispatch item updated event
    window.dispatchEvent(new CustomEvent(CartEventType.ITEM_UPDATED, {
      detail: { item: { ...item, quantity } }
    }));
  }, [state.items, removeItem]);

  // Clear cart
  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });

    // Dispatch cart cleared event
    window.dispatchEvent(new CustomEvent(CartEventType.CART_CLEARED, {
      detail: { clearedItems: state.items }
    }));
  }, [state.items]);

  // Get specific item
  const getItem = useCallback((productId: string, variants?: Record<string, string>) => {
    return findCartItem(state.items, productId, variants);
  }, [state.items]);

  // Check if product is in cart
  const isInCart = useCallback((productId: string, variants?: Record<string, string>) => {
    return !!findCartItem(state.items, productId, variants);
  }, [state.items]);

  // Get total quantity for a product
  const getProductQuantity = useCallback((productId: string) => {
    return getProductTotalQuantity(state.items, productId);
  }, [state.items]);

  const contextValue: CartContextType = {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItem,
    isInCart,
    getProductQuantity,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
