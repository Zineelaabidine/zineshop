import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Package } from 'lucide-react';

interface ProductDetail {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category_name: string | null;
  created_at: string;
}

interface ProductInfoProps {
  product: ProductDetail;
  finalPrice: number;
  className?: string;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ 
  product, 
  finalPrice, 
  className = '' 
}) => {
  // Determine stock status
  const getStockStatus = () => {
    if (product.stock === 0) {
      return {
        icon: <XCircle className="w-5 h-5 text-red-400" />,
        text: 'Out of Stock',
        textColor: 'text-red-400',
        bgColor: 'bg-red-400/10'
      };
    } else if (product.stock <= 5) {
      return {
        icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
        text: `Only ${product.stock} left in stock`,
        textColor: 'text-yellow-400',
        bgColor: 'bg-yellow-400/10'
      };
    } else if (product.stock <= 10) {
      return {
        icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
        text: `${product.stock} in stock`,
        textColor: 'text-yellow-400',
        bgColor: 'bg-yellow-400/10'
      };
    } else {
      return {
        icon: <CheckCircle className="w-5 h-5 text-green-400" />,
        text: 'In Stock',
        textColor: 'text-green-400',
        bgColor: 'bg-green-400/10'
      };
    }
  };

  const stockStatus = getStockStatus();

  // Check if price has changed (variant modifier applied)
  const hasPriceChange = finalPrice !== product.price;

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Check if product is new (created within last 7 days)
  const isNewProduct = () => {
    const createdDate = new Date(product.created_at);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return createdDate > weekAgo;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Product Name & Category */}
      <div>
        <div className="flex items-center space-x-3 mb-2">
          {/* Category Badge */}
          {product.category_name && (
            <span className="text-sm text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full">
              {product.category_name}
            </span>
          )}
          
          {/* New Product Badge */}
          {isNewProduct() && (
            <span className="text-sm text-green-400 bg-green-400/10 px-3 py-1 rounded-full">
              New
            </span>
          )}
        </div>
        
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-100 leading-tight">
          {product.name}
        </h1>
      </div>

      {/* Price Display */}
      <div className="space-y-2">
        <div className="flex items-baseline space-x-3">
          <span className="text-3xl lg:text-4xl font-bold text-gray-100">
            {formatPrice(finalPrice)}
          </span>
          
          {/* Show original price if variant modifier applied */}
          {hasPriceChange && (
            <span className="text-xl text-gray-500 line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
        
        {/* Price change indicator */}
        {hasPriceChange && (
          <p className="text-sm text-blue-400">
            {finalPrice > product.price ? '+' : ''}
            {formatPrice(finalPrice - product.price)} for selected options
          </p>
        )}
      </div>

      {/* Stock Status */}
      <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg ${stockStatus.bgColor}`}>
        {stockStatus.icon}
        <span className={`font-medium ${stockStatus.textColor}`}>
          {stockStatus.text}
        </span>
      </div>

      {/* Product Description */}
      {product.description && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-200">Description</h3>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>
          </div>
        </div>
      )}

      {/* Product Details */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-200">Product Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Package className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Product ID</span>
            </div>
            <span className="text-gray-200 font-mono text-sm">
              {product.id.slice(0, 8)}...
            </span>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Availability</span>
            </div>
            <span className={`font-medium ${stockStatus.textColor}`}>
              {product.stock > 0 ? 'Available' : 'Out of Stock'}
            </span>
          </div>
        </div>
      </div>

      {/* Additional Product Info */}
      <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
        <h4 className="font-medium text-gray-200">Shipping & Returns</h4>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• Free shipping on orders over $50</li>
          <li>• 30-day return policy</li>
          <li>• 1-year warranty included</li>
          <li>• Ships within 1-2 business days</li>
        </ul>
      </div>
    </div>
  );
};

export default ProductInfo;
