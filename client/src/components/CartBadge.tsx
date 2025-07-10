import React from 'react';
import { useCart } from '../contexts/CartContext';

interface CartBadgeProps {
  /**
   * Custom CSS classes
   */
  className?: string;
  
  /**
   * Badge size variant
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Badge color variant
   */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  
  /**
   * Maximum number to display before showing "99+"
   */
  maxCount?: number;
  
  /**
   * Whether to show the badge when count is 0
   */
  showZero?: boolean;
}

/**
 * Cart Badge Component
 * 
 * Displays the current cart item count as a badge.
 * Automatically updates when cart changes.
 */
const CartBadge: React.FC<CartBadgeProps> = ({
  className = '',
  size = 'md',
  variant = 'primary',
  maxCount = 99,
  showZero = false
}) => {
  const { totalItems } = useCart();

  // Don't render if count is 0 and showZero is false
  if (totalItems === 0 && !showZero) {
    return null;
  }

  // Size classes
  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-xs',
    lg: 'w-6 h-6 text-sm'
  };

  // Variant classes
  const variantClasses = {
    primary: 'bg-blue-500 text-white',
    secondary: 'bg-gray-500 text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-black',
    danger: 'bg-red-500 text-white'
  };

  // Format count for display
  const displayCount = totalItems > maxCount ? `${maxCount}+` : totalItems.toString();

  return (
    <span
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        rounded-full
        flex items-center justify-center
        font-medium
        absolute -top-1 -right-1
        ${className}
      `}
      title={`${totalItems} item${totalItems !== 1 ? 's' : ''} in cart`}
    >
      {displayCount}
    </span>
  );
};

export default CartBadge;

/**
 * Usage Examples:
 * 
 * Basic usage:
 * <div className="relative">
 *   <ShoppingCartIcon />
 *   <CartBadge />
 * </div>
 * 
 * Custom styling:
 * <CartBadge 
 *   size="lg" 
 *   variant="success" 
 *   maxCount={999}
 *   className="border-2 border-white"
 * />
 * 
 * Show zero count:
 * <CartBadge showZero={true} />
 */
