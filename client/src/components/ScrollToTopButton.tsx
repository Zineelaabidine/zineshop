import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { useScrollToTop } from '../hooks/useScrollToTop';

interface ScrollToTopButtonProps {
  /**
   * Scroll position threshold to show the button
   * @default 300
   */
  showAfter?: number;
  
  /**
   * Position of the button
   * @default 'bottom-right'
   */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  
  /**
   * Size of the button
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Custom CSS classes
   */
  className?: string;
  
  /**
   * Whether to enable smooth scrolling
   * @default true
   */
  smooth?: boolean;
  
  /**
   * Custom icon component
   */
  icon?: React.ReactNode;
  
  /**
   * Button label for accessibility
   * @default 'Scroll to top'
   */
  label?: string;
}

/**
 * Floating Scroll to Top Button
 * 
 * A floating action button that appears when the user scrolls down
 * and allows them to quickly return to the top of the page.
 */
const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({
  showAfter = 300,
  position = 'bottom-right',
  size = 'md',
  className = '',
  smooth = true,
  icon,
  label = 'Scroll to top'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollToTop } = useScrollToTop({ smooth });

  // Monitor scroll position
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > showAfter) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', toggleVisibility);

    // Check initial scroll position
    toggleVisibility();

    // Cleanup
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, [showAfter]);

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  // Size classes
  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-14 h-14 text-lg'
  };

  // Icon size classes
  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed z-50 
        ${positionClasses[position]} 
        ${sizeClasses[size]}
        bg-gradient-to-r from-blue-500 to-purple-600 
        hover:from-blue-600 hover:to-purple-700
        text-white 
        rounded-full 
        shadow-lg hover:shadow-xl 
        transition-all duration-300 
        transform hover:scale-110 hover:-translate-y-1
        flex items-center justify-center
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
        active:scale-95
        ${className}
      `}
      aria-label={label}
      title={label}
    >
      {icon || <ChevronUp className={iconSizeClasses[size]} />}
    </button>
  );
};

export default ScrollToTopButton;

/**
 * Usage Examples:
 * 
 * Basic usage:
 * <ScrollToTopButton />
 * 
 * Custom position and size:
 * <ScrollToTopButton 
 *   position="bottom-left" 
 *   size="lg" 
 *   showAfter={500} 
 * />
 * 
 * Custom styling:
 * <ScrollToTopButton 
 *   className="bg-red-500 hover:bg-red-600" 
 *   icon={<ArrowUp className="w-5 h-5" />}
 * />
 * 
 * No smooth scrolling:
 * <ScrollToTopButton smooth={false} />
 */
