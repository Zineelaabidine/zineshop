import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, Package, ChevronDown } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '../utils/cartUtils';
import { CartError } from '../types/cart';
import './CartDrawer.css';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { 
    items, 
    totalItems, 
    totalPrice, 
    removeItem, 
    updateQuantity, 
    clearCart,
    isLoading 
  } = useCart();
  
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);



  // Check if content is scrollable
  useEffect(() => {
    const checkScrollable = () => {
      const container = scrollContainerRef.current;
      if (container) {
        const hasScroll = container.scrollHeight > container.clientHeight;
        const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 10;
        setShowScrollIndicator(hasScroll && !isAtBottom);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      checkScrollable();
      container.addEventListener('scroll', checkScrollable);
      window.addEventListener('resize', checkScrollable);

      return () => {
        container.removeEventListener('scroll', checkScrollable);
        window.removeEventListener('resize', checkScrollable);
      };
    }
  }, [items.length, isOpen]);

  // Handle quantity update
  const handleQuantityUpdate = async (itemId: string, newQuantity: number) => {
    try {
      setError(null);
      setUpdatingItems(prev => new Set([...prev, itemId]));
      
      updateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
      if (error instanceof CartError) {
        setError(error.message);
      } else {
        setError('Failed to update quantity');
      }
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  // Handle item removal
  const handleRemoveItem = (itemId: string) => {
    try {
      setError(null);
      removeItem(itemId);
    } catch (error) {
      console.error('Error removing item:', error);
      setError('Failed to remove item');
    }
  };

  // Handle clear cart
  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        setError(null);
        clearCart();
      } catch (error) {
        console.error('Error clearing cart:', error);
        setError('Failed to clear cart');
      }
    }
  };

  // Format variants for display
  const formatVariants = (variants?: Record<string, string>) => {
    if (!variants || Object.keys(variants).length === 0) return null;
    
    return Object.entries(variants)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={`
        fixed top-0 right-0 w-full max-w-md bg-gray-900 shadow-2xl z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        border-l border-gray-700
        flex flex-col
        h-screen max-h-[80vh] sm:max-h-[75vh] lg:max-h-[70vh]
        sm:top-4 sm:bottom-4 sm:rounded-l-2xl
      `}>
        {/* Header - Fixed */}
        <div className="flex-shrink-0 border-b border-gray-700 bg-gray-900">
          <div className="flex items-center justify-between p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <ShoppingBag className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold text-gray-100">
                Shopping Cart
              </h2>
              {totalItems > 0 && (
                <span className="bg-blue-500 text-white text-sm px-2 py-1 rounded-full">
                  {totalItems}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-200 transition-colors duration-200 rounded-lg hover:bg-gray-800"
              aria-label="Close cart"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-4 sm:mx-6 pb-4 sm:pb-6">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Cart Content - Scrollable */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto min-h-0 relative cart-scrollable"
        >
          {isLoading && items.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading cart...</p>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 px-4 sm:px-6">
              <Package className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 text-center">
                Add some products to get started!
              </p>
            </div>
          ) : (
            <div className="p-4 sm:p-6 space-y-4 pb-4">
              {items.map((item) => (
                <div key={item.id} className="bg-gray-800 rounded-lg p-4 space-y-3">
                  {/* Product Info */}
                  <div className="flex space-x-3">
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-gray-100 font-medium truncate">{item.name}</h4>
                      <p className="text-blue-400 font-semibold">{formatPrice(item.price)}</p>
                      {formatVariants(item.variants) && (
                        <p className="text-gray-400 text-sm">{formatVariants(item.variants)}</p>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 text-gray-400 hover:text-red-400 transition-colors duration-200"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                        disabled={updatingItems.has(item.id) || item.quantity <= 1}
                        className="w-8 h-8 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      
                      <span className="w-12 text-center text-gray-100 font-medium">
                        {updatingItems.has(item.id) ? '...' : item.quantity}
                      </span>
                      
                      <button
                        onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                        disabled={updatingItems.has(item.id) || item.quantity >= item.maxStock}
                        className="w-8 h-8 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="text-gray-100 font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-gray-400 text-xs">
                          {item.quantity} × {formatPrice(item.price)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stock Warning */}
                  {item.quantity >= item.maxStock && (
                    <div className="text-yellow-400 text-xs">
                      Maximum stock reached ({item.maxStock} available)
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Scroll Indicator */}
          {showScrollIndicator && (
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-900 to-transparent flex items-end justify-center pb-2 pointer-events-none">
              <div className="scroll-indicator">
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          )}
        </div>

        {/* Footer - Sticky */}
        {items.length > 0 && (
          <div className="flex-shrink-0 border-t border-gray-700 bg-gray-900 sticky bottom-0">
            <div className="p-4 sm:p-6 space-y-4">
              {/* Total */}
              <div className="flex items-center justify-between text-lg font-bold">
                <span className="text-gray-200">Total:</span>
                <span className="text-gray-100">{formatPrice(totalPrice)}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Proceed to Checkout - Primary Action */}
                <button className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 transform hover:-translate-y-0.5 min-h-[44px] flex items-center justify-center">
                  Proceed to Checkout
                </button>

                {/* Clear Cart - Secondary Action */}
                <button
                  onClick={handleClearCart}
                  className="flex-1 sm:flex-none sm:w-auto bg-gray-700 text-gray-300 py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors duration-200 min-h-[44px] flex items-center justify-center"
                >
                  Clear Cart
                </button>
              </div>

              {/* Cart Summary */}
              <div className="text-center text-gray-400 text-sm">
                {totalItems} item{totalItems !== 1 ? 's' : ''} in your cart
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
