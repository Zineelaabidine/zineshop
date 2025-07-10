import React, { useState } from 'react';
import { ShoppingCart, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { CartError } from '../types/cart';

interface ProductDetail {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string | null;
}

interface AddToCartButtonProps {
  product: ProductDetail;
  selectedVariants: Record<string, string>;
  quantity: number;
  finalPrice: number;
  isAvailable: boolean;
  className?: string;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  selectedVariants,
  quantity,
  finalPrice,
  isAvailable,
  className = ''
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { addItem, isInCart, getItem } = useCart();

  // Handle add to cart action
  const handleAddToCart = async () => {
    if (!isAvailable || isAdding) return;

    try {
      setIsAdding(true);
      setError(null);

      // Prepare cart item data
      const cartItemData = {
        productId: product.id,
        name: product.name,
        price: finalPrice,
        quantity: quantity,
        variants: selectedVariants,
        image: product.image_url,
        maxStock: product.stock
      };

      // Add item to cart using context
      addItem(cartItemData);

      // Show success state
      setIsAdded(true);

      // Reset success state after 2 seconds
      setTimeout(() => {
        setIsAdded(false);
      }, 2000);

    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error instanceof CartError) {
        setError(error.message);
      } else {
        setError('Failed to add item to cart. Please try again.');
      }
    } finally {
      setIsAdding(false);
    }
  };



  // Check if all required variants are selected
  const hasRequiredVariants = () => {
    // For now, assume all variants are optional
    // In a real app, you might have required variants
    return true;
  };

  // Get button text based on state
  const getButtonText = () => {
    if (isAdding) return 'Adding...';
    if (isAdded) return 'Added to Cart!';
    if (!isAvailable) return 'Out of Stock';
    if (!hasRequiredVariants()) return 'Select Options';
    return 'Add to Cart';
  };

  // Get button icon based on state
  const getButtonIcon = () => {
    if (isAdding) return <Loader2 className="w-5 h-5 animate-spin" />;
    if (isAdded) return <Check className="w-5 h-5" />;
    if (!isAvailable) return <AlertCircle className="w-5 h-5" />;
    return <ShoppingCart className="w-5 h-5" />;
  };

  // Get button styling based on state
  const getButtonStyling = () => {
    if (!isAvailable) {
      return 'bg-gray-600 text-gray-400 cursor-not-allowed';
    }
    if (isAdded) {
      return 'bg-green-600 text-white';
    }
    if (!hasRequiredVariants()) {
      return 'bg-gray-600 text-gray-400 cursor-not-allowed';
    }
    return 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={!isAvailable || isAdding || !hasRequiredVariants()}
        className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-3 ${getButtonStyling()}`}
      >
        {getButtonIcon()}
        <span>{getButtonText()}</span>
      </button>

      {/* Cart Summary */}
      <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
        <h4 className="font-medium text-gray-200">Order Summary</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Item Price:</span>
            <span className="text-gray-200">${product.price.toFixed(2)}</span>
          </div>
          
          {finalPrice !== product.price && (
            <div className="flex justify-between">
              <span className="text-gray-400">Options:</span>
              <span className="text-gray-200">
                +${(finalPrice - product.price).toFixed(2)}
              </span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-gray-400">Quantity:</span>
            <span className="text-gray-200">{quantity}</span>
          </div>
          
          <div className="border-t border-gray-700 pt-2 mt-2">
            <div className="flex justify-between font-semibold">
              <span className="text-gray-200">Total:</span>
              <span className="text-gray-100">${(finalPrice * quantity).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Actions */}
      <div className="flex space-x-3">
        <button className="flex-1 py-3 px-4 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-center">
          Add to Wishlist
        </button>
        <button className="flex-1 py-3 px-4 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-center">
          Share Product
        </button>
      </div>
    </div>
  );
};

export default AddToCartButton;
