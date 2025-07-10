import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollToTopProps {
  /**
   * Whether to enable smooth scrolling animation
   * @default true
   */
  smooth?: boolean;
  
  /**
   * Whether to enable the scroll to top behavior
   * @default true
   */
  enabled?: boolean;
  
  /**
   * Array of pathname patterns to exclude from scroll to top
   * Supports exact matches and patterns with wildcards
   * @default []
   */
  excludePatterns?: string[];
  
  /**
   * Array of search param keys that should not trigger scroll to top
   * Useful for pagination, filtering, etc.
   * @default ['page', 'limit', 'offset']
   */
  excludeSearchParams?: string[];
}

/**
 * ScrollToTop Component
 * 
 * Automatically scrolls to the top of the page when the route changes.
 * Provides intelligent handling for pagination and other navigation patterns.
 * 
 * @param smooth - Enable smooth scrolling animation (default: true)
 * @param enabled - Enable/disable scroll behavior (default: true)
 * @param excludePatterns - Pathname patterns to exclude from scroll to top
 * @param excludeSearchParams - Search param keys that shouldn't trigger scroll
 */
const ScrollToTop: React.FC<ScrollToTopProps> = ({
  smooth = true,
  enabled = true,
  excludePatterns = [],
  excludeSearchParams = ['page', 'limit', 'offset', 'sort', 'filter', 'search']
}) => {
  const location = useLocation();

  useEffect(() => {
    // Early return if scroll to top is disabled
    if (!enabled) return;

    // Check if current pathname should be excluded
    const shouldExcludeByPath = excludePatterns.some(pattern => {
      // Support for exact matches
      if (pattern === location.pathname) return true;
      
      // Support for wildcard patterns (e.g., "/admin/*")
      if (pattern.includes('*')) {
        const regexPattern = pattern.replace(/\*/g, '.*');
        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(location.pathname);
      }
      
      return false;
    });

    if (shouldExcludeByPath) return;

    // Check if URL contains search params that should prevent scroll to top
    const searchParams = new URLSearchParams(location.search);
    const shouldExcludeBySearchParams = excludeSearchParams.some(param => 
      searchParams.has(param)
    );

    // Special handling for pagination-like navigation
    // If only pagination/filtering params are present, don't scroll to top
    if (shouldExcludeBySearchParams) {
      // Check if this is likely a pagination/filtering action
      // by seeing if we're on the same base path
      const currentPath = location.pathname;
      const hasOnlyExcludedParams = Array.from(searchParams.keys()).every(key =>
        excludeSearchParams.includes(key)
      );

      if (hasOnlyExcludedParams) {
        return; // Don't scroll for pagination/filtering
      }
    }

    // Perform scroll to top
    const scrollOptions: ScrollToOptions = {
      top: 0,
      left: 0,
      behavior: smooth ? 'smooth' : 'auto'
    };

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      window.scrollTo(scrollOptions);
    });

    // Optional: Also scroll any scrollable containers to top
    // This is useful for modal overlays or custom scroll containers
    const scrollableContainers = document.querySelectorAll('[data-scroll-container]');
    scrollableContainers.forEach(container => {
      if (container instanceof HTMLElement) {
        container.scrollTo({
          top: 0,
          left: 0,
          behavior: smooth ? 'smooth' : 'auto'
        });
      }
    });

  }, [location.pathname, location.search, smooth, enabled, excludePatterns, excludeSearchParams]);

  // This component doesn't render anything
  return null;
};

export default ScrollToTop;

/**
 * Usage Examples:
 * 
 * Basic usage (recommended):
 * <ScrollToTop />
 * 
 * With custom configuration:
 * <ScrollToTop 
 *   smooth={false}
 *   excludePatterns={['/admin/*', '/dashboard']}
 *   excludeSearchParams={['page', 'filter', 'sort']}
 * />
 * 
 * Conditionally enabled:
 * <ScrollToTop enabled={!isInfiniteScrollPage} />
 * 
 * For infinite scroll pages:
 * <ScrollToTop excludePatterns={['/products/infinite']} />
 */
