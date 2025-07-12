import React, { useState, useEffect } from 'react';
import { Star, ShoppingCart, Eye, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductRating from './ProductRating';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  stock: number;
  category_name: string | null;
  created_at: string;
  average_rating: number | null;
  review_count: number;
}

const ProductShowcase: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch featured products from API
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/products/featured?limit=6');
        const data = await response.json();

        if (data.success && data.data) {
          setProducts(data.data.products);
        } else {
          setError(data.message || 'Failed to fetch featured products');
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
        setError('Network error while fetching products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <section className="py-20 bg-gray-100 dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Featured Products
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover our most innovative and popular products, carefully curated for the future
            </p>
          </div>
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-20 bg-gray-100 dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Featured Products
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover our most innovative and popular products, carefully curated for the future
            </p>
          </div>
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  // No products state
  if (products.length === 0) {
    return (
      <section className="py-20 bg-gray-100 dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Featured Products
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover our most innovative and popular products, carefully curated for the future
            </p>
          </div>
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No featured products available at the moment</p>
            <Link
              to="/products"
              className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
            >
              Browse All Products
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-100 dark:bg-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Featured Products
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover our most innovative and popular products, carefully curated for the future
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="group relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 dark:hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-200 dark:border-gray-700 block"
            >
              {/* Badge for new products (created within last 7 days) */}
              {new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  New
                </div>
              )}

              {/* Product Image */}
              <div className="relative overflow-hidden">
                {product.image_url ? (
                  <div className="relative">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        // Hide broken image and show fallback
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    {/* Fallback for broken images */}
                    <div
                      className="w-full h-64 bg-gray-700 flex items-center justify-center absolute inset-0"
                      style={{ display: 'none' }}
                    >
                      <Package className="w-16 h-16 text-gray-500" />
                    </div>
                  </div>
                ) : null}
                {/* Fallback for products without image_url */}
                {!product.image_url && (
                  <div className="w-full h-64 bg-gray-700 flex items-center justify-center">
                    <Package className="w-16 h-16 text-gray-500" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Quick Actions */}
                <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 shadow-md">
                    <Eye className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  </button>
                  <button className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 shadow-md">
                    <ShoppingCart className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200">
                  {product.name}
                </h3>

                {/* Category */}
                {product.category_name && (
                  <div className="mb-2">
                    <span className="text-sm text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-400/10 px-2 py-1 rounded-full">
                      {product.category_name}
                    </span>
                  </div>
                )}

                {/* Rating */}
                <div className="mb-3">
                  <ProductRating
                    averageRating={product.average_rating}
                    reviewCount={product.review_count}
                    size="sm"
                  />
                </div>

                {/* Description */}
                {product.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 overflow-hidden" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {product.description}
                  </p>
                )}

                {/* Stock indicator */}
                <div className="flex items-center space-x-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${
                    product.stock > 10 ? 'bg-green-400' :
                    product.stock > 0 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {product.stock > 10 ? 'In Stock' :
                     product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">${product.price.toFixed(2)}</span>
                  </div>
                  <button
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:-translate-y-0.5 ${
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
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            to="/products"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 transform hover:-translate-y-1"
          >
            <span>View All Products</span>
            <ShoppingCart className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;