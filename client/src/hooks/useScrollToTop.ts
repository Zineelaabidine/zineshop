import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface UseScrollToTopOptions {
  /**
   * Whether to enable smooth scrolling animation
   * @default true
   */
  smooth?: boolean;
  
  /**
   * Whether to automatically scroll on route changes
   * @default false (manual control)
   */
  auto?: boolean;
  
  /**
   * Delay before scrolling (in milliseconds)
   * Useful for waiting for content to load
   * @default 0
   */
  delay?: number;
  
  /**
   * Custom scroll target element selector
   * @default window (scrolls the main page)
   */
  target?: string;
}

interface UseScrollToTopReturn {
  /**
   * Manually trigger scroll to top
   */
  scrollToTop: () => void;
  
  /**
   * Scroll to a specific position
   */
  scrollTo: (top: number, left?: number) => void;
  
  /**
   * Check if currently at the top of the page
   */
  isAtTop: boolean;
}

/**
 * Custom hook for scroll to top functionality
 * 
 * Provides both automatic and manual scroll control with advanced options.
 * Useful for components that need fine-grained control over scrolling behavior.
 * 
 * @param options - Configuration options for scroll behavior
 * @returns Object with scroll control functions and state
 */
export const useScrollToTop = (options: UseScrollToTopOptions = {}): UseScrollToTopReturn => {
  const {
    smooth = true,
    auto = false,
    delay = 0,
    target
  } = options;

  const location = useLocation();

  /**
   * Get the scroll target element
   */
  const getScrollTarget = useCallback((): Element | Window => {
    if (target) {
      const element = document.querySelector(target);
      return element || window;
    }
    return window;
  }, [target]);

  /**
   * Perform scroll to top action
   */
  const scrollToTop = useCallback(() => {
    const performScroll = () => {
      const scrollTarget = getScrollTarget();
      
      if (scrollTarget === window) {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: smooth ? 'smooth' : 'auto'
        });
      } else if (scrollTarget instanceof HTMLElement) {
        scrollTarget.scrollTo({
          top: 0,
          left: 0,
          behavior: smooth ? 'smooth' : 'auto'
        });
      }
    };

    if (delay > 0) {
      setTimeout(performScroll, delay);
    } else {
      // Use requestAnimationFrame for better performance
      requestAnimationFrame(performScroll);
    }
  }, [smooth, delay, getScrollTarget]);

  /**
   * Scroll to a specific position
   */
  const scrollTo = useCallback((top: number, left: number = 0) => {
    const scrollTarget = getScrollTarget();
    
    if (scrollTarget === window) {
      window.scrollTo({
        top,
        left,
        behavior: smooth ? 'smooth' : 'auto'
      });
    } else if (scrollTarget instanceof HTMLElement) {
      scrollTarget.scrollTo({
        top,
        left,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  }, [smooth, getScrollTarget]);

  /**
   * Check if currently at the top
   */
  const isAtTop = (() => {
    if (typeof window === 'undefined') return true;
    
    const scrollTarget = getScrollTarget();
    if (scrollTarget === window) {
      return window.scrollY === 0;
    } else if (scrollTarget instanceof HTMLElement) {
      return scrollTarget.scrollTop === 0;
    }
    return true;
  })();

  // Auto scroll on route changes
  useEffect(() => {
    if (auto) {
      scrollToTop();
    }
  }, [location.pathname, auto, scrollToTop]);

  return {
    scrollToTop,
    scrollTo,
    isAtTop
  };
};

/**
 * Usage Examples:
 * 
 * Basic manual control:
 * const { scrollToTop } = useScrollToTop();
 * 
 * Auto scroll on route changes:
 * const { scrollToTop, isAtTop } = useScrollToTop({ auto: true });
 * 
 * Custom scroll target:
 * const { scrollToTop } = useScrollToTop({ 
 *   target: '.modal-content',
 *   smooth: false 
 * });
 * 
 * With delay (useful for loading states):
 * const { scrollToTop } = useScrollToTop({ 
 *   auto: true, 
 *   delay: 300 
 * });
 * 
 * Manual scroll to specific position:
 * const { scrollTo } = useScrollToTop();
 * scrollTo(500); // Scroll to 500px from top
 */

export default useScrollToTop;
