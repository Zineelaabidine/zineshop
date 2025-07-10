import React, { useState, useEffect, useCallback } from 'react';
import { Star, ShoppingCart, Eye, Filter, Grid, List, ArrowLeft, Package, Loader2, AlertCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  stock: number;
  category_name: string | null;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  created_at: string;
}

interface ProductsResponse {
  success: boolean;
  message: string;
  data?: {
    products: Product[];
    totalCount: number;
  };
}

interface CategoriesResponse {
  success: boolean;
  message: string;
  data?: {
    categories: Category[];
  };
}

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // UI state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter state - initialized from URL params
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || '');

  // Pagination state - initialized from URL params
  const [currentPage, setCurrentPage] = useState<number>(parseInt(searchParams.get('page') || '1'));
  const [totalPages, setTotalPages] = useState<number>(0);

  // Responsive products per page
  const [productsPerPage, setProductsPerPage] = useState<number>(24);

  // API state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Update responsive products per page based on screen size
  useEffect(() => {
    const updateProductsPerPage = () => {
      const isMobile = window.innerWidth < 768;
      setProductsPerPage(isMobile ? 12 : 24);
    };

    updateProductsPerPage();
    window.addEventListener('resize', updateProductsPerPage);
    return () => window.removeEventListener('resize', updateProductsPerPage);
  }, []);

  // Update URL params when state changes
  const updateURLParams = useCallback((page: number, category: string, search: string) => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', page.toString());
    if (category !== 'all') params.set('category', category);
    if (search.trim()) params.set('search', search.trim());

    setSearchParams(params);
  }, [setSearchParams]);

  // Fetch products from API with pagination
  const fetchProducts = async (category: string = 'all', search: string = '', page: number = 1) => {
    try {
      setIsLoadingProducts(true);
      setError(null);

      const params = new URLSearchParams();
      if (category !== 'all') {
        params.append('category', category);
      }
      if (search.trim()) {
        params.append('search', search.trim());
      }
      params.append('page', page.toString());
      params.append('limit', productsPerPage.toString());

      const response = await fetch(`/api/products?${params.toString()}`);
      const data: ProductsResponse = await response.json();

      if (data.success && data.data) {
        setProducts(data.data.products);
        setTotalCount(data.data.totalCount);
        setTotalPages(Math.ceil(data.data.totalCount / productsPerPage));

        // Update URL params
        updateURLParams(page, category, search);
      } else {
        setError(data.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Network error while fetching products');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);

      const response = await fetch('/api/products/categories');
      const data: CategoriesResponse = await response.json();

      if (data.success && data.data) {
        setCategories(data.data.categories);
      } else {
        console.error('Failed to fetch categories:', data.message);
        // Don't set error for categories as it's not critical
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Don't set error for categories as it's not critical
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Load categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Refetch products when filters, page, or productsPerPage changes
  useEffect(() => {
    fetchProducts(selectedCategory, searchQuery, currentPage);
  }, [selectedCategory, searchQuery, currentPage, productsPerPage]);

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when changing category
  };

  // Handle search change with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when searching
      fetchProducts(selectedCategory, searchQuery, 1);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      // Scroll to top when changing pages
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Create categories list with "All Products" option
  const allCategories = [
    { id: 'all', name: 'All Products', created_at: '' },
    ...categories
  ];

  // Generate pagination numbers
  const generatePaginationNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  // Calculate results range for display
  const getResultsRange = () => {
    const start = (currentPage - 1) * productsPerPage + 1;
    const end = Math.min(currentPage * productsPerPage, totalCount);
    return { start, end };
  };

  const resultsRange = getResultsRange();

  // Loading state
  if (isLoadingProducts && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
              <p className="text-gray-300 text-lg">Loading products...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-400 text-lg mb-4">{error}</p>
              <button
                onClick={() => fetchProducts(selectedCategory, searchQuery)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <div className="h-6 w-px bg-gray-600"></div>
            <h1 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                All Products
              </span>
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {isLoadingProducts && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors duration-200 ${
                  viewMode === 'list'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-gray-300 font-medium">Filter by Category:</span>
            {isLoadingCategories && (
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {allCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Count and Pagination Info */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-gray-400">
              {totalCount > 0 ? (
                <>
                  Showing <span className="text-gray-200 font-medium">{resultsRange.start}-{resultsRange.end}</span> of{' '}
                  <span className="text-gray-200 font-medium">{totalCount}</span> product{totalCount !== 1 ? 's' : ''}
                  {selectedCategory !== 'all' && (
                    <span className="ml-2">
                      in <span className="text-blue-400">{allCategories.find(c => c.id === selectedCategory)?.name}</span>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="ml-2">
                      for "<span className="text-blue-400">{searchQuery}</span>"
                    </span>
                  )}
                </>
              ) : (
                'No products found'
              )}
            </p>
          </div>

          {totalPages > 1 && (
            <div className="text-sm text-gray-400">
              Page <span className="text-gray-200 font-medium">{currentPage}</span> of{' '}
              <span className="text-gray-200 font-medium">{totalPages}</span>
            </div>
          )}
        </div>

        {/* No Products State */}
        {products.length === 0 && !isLoadingProducts && (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No products found</h3>
            <p className="text-gray-400 mb-6">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No products are currently available'}
            </p>
            {(searchQuery || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setCurrentPage(1);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Products Grid/List */}
        {products.length > 0 && (
          <div className={`${
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
              : 'space-y-6'
          }`}>
            {products.map((product) => (
              <div
                key={product.id}
                className={`group relative bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-700 ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                {/* Badge for new products (created within last 7 days) */}
                {new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                  <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    New
                  </div>
                )}

                {/* Low stock badge */}
                {product.stock <= 5 && product.stock > 0 && (
                  <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Low Stock
                  </div>
                )}

                {/* Product Image */}
                <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                  {product.image_url ? (
                    <div className="relative">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className={`object-cover transition-transform duration-300 group-hover:scale-110 ${
                          viewMode === 'list' ? 'w-full h-full' : 'w-full h-64'
                        }`}
                        onError={(e) => {
                          // Hide broken image and show fallback
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div
                        className={`hidden items-center justify-center bg-gray-700 ${
                          viewMode === 'list' ? 'w-full h-full' : 'w-full h-64'
                        }`}
                      >
                        <Package className="w-12 h-12 text-gray-400" />
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`flex items-center justify-center bg-gray-700 ${
                        viewMode === 'list' ? 'w-full h-full' : 'w-full h-64'
                      }`}
                    >
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Quick Actions */}
                  <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="p-2 bg-gray-800/90 rounded-full hover:bg-gray-700 transition-colors duration-200">
                      <Eye className="w-4 h-4 text-gray-300" />
                    </button>
                    <button
                      className="p-2 bg-gray-800/90 rounded-full hover:bg-gray-700 transition-colors duration-200"
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart className={`w-4 h-4 ${product.stock === 0 ? 'text-gray-500' : 'text-gray-300'}`} />
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-100 group-hover:text-blue-400 transition-colors duration-200 flex-1">
                      {product.name}
                    </h3>
                    {product.category_name && (
                      <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded-full ml-2">
                        {product.category_name}
                      </span>
                    )}
                  </div>

                  {viewMode === 'list' && product.description && (
                    <p className="text-gray-400 mb-3 text-sm">{product.description}</p>
                  )}

                  {/* Stock Status */}
                  <div className="flex items-center space-x-2 mb-3">
                    <div className={`w-2 h-2 rounded-full ${
                      product.stock > 10 ? 'bg-green-400' :
                      product.stock > 0 ? 'bg-yellow-400' : 'bg-red-400'
                    }`}></div>
                    <span className={`text-sm ${
                      product.stock > 10 ? 'text-green-400' :
                      product.stock > 0 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {product.stock > 10 ? 'In Stock' :
                       product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-gray-100">${product.price.toFixed(2)}</span>
                    </div>
                    <button
                      className={`px-4 py-2 rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 ${
                        product.stock > 0
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                      disabled={product.stock === 0}
                    >
                      {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-12 flex flex-col items-center space-y-4">
            {/* Pagination Navigation */}
            <div className="flex items-center space-x-2">
              {/* First Page */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  currentPage === 1
                    ? 'text-gray-500 cursor-not-allowed'
                    : 'text-gray-300 hover:text-blue-400 hover:bg-gray-800'
                }`}
                title="First page"
              >
                <ChevronsLeft className="w-5 h-5" />
              </button>

              {/* Previous Page */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  currentPage === 1
                    ? 'text-gray-500 cursor-not-allowed'
                    : 'text-gray-300 hover:text-blue-400 hover:bg-gray-800'
                }`}
                title="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {generatePaginationNumbers().map((pageNum, index) => (
                  <div key={index}>
                    {pageNum === '...' ? (
                      <span className="px-3 py-2 text-gray-500">...</span>
                    ) : (
                      <button
                        onClick={() => handlePageChange(pageNum as number)}
                        className={`px-3 py-2 rounded-lg transition-all duration-200 min-w-[40px] ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                            : 'text-gray-300 hover:text-blue-400 hover:bg-gray-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Next Page */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  currentPage === totalPages
                    ? 'text-gray-500 cursor-not-allowed'
                    : 'text-gray-300 hover:text-blue-400 hover:bg-gray-800'
                }`}
                title="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Last Page */}
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  currentPage === totalPages
                    ? 'text-gray-500 cursor-not-allowed'
                    : 'text-gray-300 hover:text-blue-400 hover:bg-gray-800'
                }`}
                title="Last page"
              >
                <ChevronsRight className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile-friendly page info */}
            <div className="text-sm text-gray-400 text-center">
              Page {currentPage} of {totalPages} • {totalCount} total products
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
