import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import ProductImageCarousel from '../components/ProductImageCarousel';
import ProductInfo from '../components/ProductInfo';
import ProductVariants from '../components/ProductVariants';
import AddToCartButton from '../components/AddToCartButton';
import ProductRating from '../components/ProductRating';
import ProductReviews from '../components/ProductReviews';

// Product interface matching your database schema
interface ProductDetail {
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
  images?: string[]; // Additional images for carousel
  variants?: ProductVariant[];
}

interface ProductVariant {
  id: string;
  type: 'size' | 'color' | 'style';
  name: string;
  value: string;
  price_modifier?: number; // Additional cost for this variant
  stock?: number;
}

interface ProductDetailResponse {
  success: boolean;
  message: string;
  data?: {
    product: ProductDetail;
  };
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State management
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  // Fetch product details
  const fetchProductDetail = async (productId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/products/${productId}`);
      const data: ProductDetailResponse = await response.json();

      if (data.success && data.data) {
        setProduct(data.data.product);
      } else {
        setError(data.message || 'Product not found');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Failed to load product details');
    } finally {
      setIsLoading(false);
    }
  };

  // Load product on component mount
  useEffect(() => {
    if (id) {
      fetchProductDetail(id);
    } else {
      setError('Invalid product ID');
      setIsLoading(false);
    }
  }, [id]);

  // Handle variant selection
  const handleVariantChange = (variantType: string, value: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [variantType]: value
    }));
  };

  // Calculate final price with variant modifiers
  const calculateFinalPrice = () => {
    if (!product) return 0;
    
    let finalPrice = product.price;
    
    // Add variant price modifiers
    if (product.variants) {
      Object.entries(selectedVariants).forEach(([type, value]) => {
        const variant = product.variants?.find(v => v.type === type && v.value === value);
        if (variant?.price_modifier) {
          finalPrice += variant.price_modifier;
        }
      });
    }
    
    return finalPrice;
  };

  // Check if product is available
  const isAvailable = product && product.stock > 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
              <p className="text-gray-300 text-lg">Loading product details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-100 mb-4">Product Not Found</h2>
              <p className="text-red-400 text-lg mb-6">{error}</p>
              <div className="space-x-4">
                <button
                  onClick={() => navigate(-1)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                >
                  Go Back
                </button>
                <Link
                  to="/products"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 inline-block"
                >
                  Browse Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 mb-8">
          <Link 
            to="/products" 
            className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Products</span>
          </Link>
          <span className="text-gray-500">/</span>
          {product.category_name && (
            <>
              <span className="text-gray-400">{product.category_name}</span>
              <span className="text-gray-500">/</span>
            </>
          )}
          <span className="text-gray-200 truncate">{product.name}</span>
        </div>

        {/* Main Product Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <ProductImageCarousel 
              images={product.images || (product.image_url ? [product.image_url] : [])}
              productName={product.name}
            />
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <ProductInfo 
              product={product}
              finalPrice={calculateFinalPrice()}
            />

            {/* Product Rating */}
            <div>
              <ProductRating 
                averageRating={product.average_rating}
                reviewCount={product.review_count}
                size="lg"
              />
            </div>

            {/* Product Variants */}
            {product.variants && product.variants.length > 0 && (
              <ProductVariants 
                variants={product.variants}
                selectedVariants={selectedVariants}
                onVariantChange={handleVariantChange}
              />
            )}

            {/* Quantity Selector & Add to Cart */}
            <div className="space-y-4">
              {/* Quantity Selector */}
              <div className="flex items-center space-x-4">
                <label className="text-gray-300 font-medium">Quantity:</label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-gray-100 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <AddToCartButton 
                product={product}
                selectedVariants={selectedVariants}
                quantity={quantity}
                finalPrice={calculateFinalPrice()}
                isAvailable={isAvailable}
              />
            </div>
          </div>
        </div>

        {/* Product Reviews Section */}
        <div className="mt-16">
          <ProductReviews 
            productId={product.id}
            averageRating={product.average_rating}
            reviewCount={product.review_count}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
