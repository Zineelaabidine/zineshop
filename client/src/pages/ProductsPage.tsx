import React, { useState } from 'react';
import { Star, ShoppingCart, Eye, Filter, Grid, List, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  image: string;
  badge?: string;
  category: string;
  description: string;
}

const ProductsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const products: Product[] = [
    {
      id: 1,
      name: "Neural Interface Headset",
      price: 299,
      originalPrice: 399,
      rating: 4.8,
      image: "https://images.pexels.com/photos/3913025/pexels-photo-3913025.jpeg?auto=compress&cs=tinysrgb&w=400",
      badge: "New",
      category: "electronics",
      description: "Advanced neural interface technology for seamless brain-computer interaction"
    },
    {
      id: 2,
      name: "Quantum Smartphone",
      price: 899,
      rating: 4.9,
      image: "https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=400",
      badge: "Best Seller",
      category: "electronics",
      description: "Revolutionary quantum-powered smartphone with unlimited processing capabilities"
    },
    {
      id: 3,
      name: "Holographic Display",
      price: 1299,
      originalPrice: 1599,
      rating: 4.7,
      image: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=400",
      badge: "Limited",
      category: "electronics",
      description: "3D holographic display technology for immersive visual experiences"
    },
    {
      id: 4,
      name: "Smart Fitness Tracker",
      price: 199,
      rating: 4.6,
      image: "https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "wearables",
      description: "Advanced health monitoring with AI-powered insights and recommendations"
    },
    {
      id: 5,
      name: "Wireless Gaming Headset",
      price: 249,
      originalPrice: 299,
      rating: 4.8,
      image: "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "gaming",
      description: "Professional-grade wireless gaming headset with 3D spatial audio"
    },
    {
      id: 6,
      name: "Smart Home Hub",
      price: 149,
      rating: 4.5,
      image: "https://images.pexels.com/photos/4219654/pexels-photo-4219654.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "smart-home",
      description: "Central control hub for all your smart home devices and automation"
    },
    {
      id: 7,
      name: "VR Gaming Headset",
      price: 599,
      originalPrice: 699,
      rating: 4.9,
      image: "https://images.pexels.com/photos/8721342/pexels-photo-8721342.jpeg?auto=compress&cs=tinysrgb&w=400",
      badge: "Popular",
      category: "gaming",
      description: "Next-generation VR headset with ultra-high resolution and haptic feedback"
    },
    {
      id: 8,
      name: "Smart Watch Pro",
      price: 399,
      rating: 4.7,
      image: "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "wearables",
      description: "Premium smartwatch with advanced health monitoring and GPS tracking"
    },
    {
      id: 9,
      name: "Wireless Earbuds",
      price: 179,
      originalPrice: 229,
      rating: 4.6,
      image: "https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "audio",
      description: "Premium wireless earbuds with active noise cancellation and long battery life"
    }
  ];

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'wearables', name: 'Wearables' },
    { id: 'gaming', name: 'Gaming' },
    { id: 'smart-home', name: 'Smart Home' },
    { id: 'audio', name: 'Audio' }
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
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

        {/* Filters */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-gray-300 font-medium">Filter by Category:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
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

        {/* Products Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Products Grid/List */}
        <div className={`${
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' 
            : 'space-y-6'
        }`}>
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`group relative bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-700 ${
                viewMode === 'list' ? 'flex' : ''
              }`}
            >
              {/* Badge */}
              {product.badge && (
                <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {product.badge}
                </div>
              )}

              {/* Product Image */}
              <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                <img
                  src={product.image}
                  alt={product.name}
                  className={`object-cover transition-transform duration-300 group-hover:scale-110 ${
                    viewMode === 'list' ? 'w-full h-full' : 'w-full h-64'
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Quick Actions */}
                <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="p-2 bg-gray-800/90 rounded-full hover:bg-gray-700 transition-colors duration-200">
                    <Eye className="w-4 h-4 text-gray-300" />
                  </button>
                  <button className="p-2 bg-gray-800/90 rounded-full hover:bg-gray-700 transition-colors duration-200">
                    <ShoppingCart className="w-4 h-4 text-gray-300" />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6 flex-1">
                <h3 className="text-xl font-semibold text-gray-100 mb-2 group-hover:text-blue-400 transition-colors duration-200">
                  {product.name}
                </h3>
                
                {viewMode === 'list' && (
                  <p className="text-gray-400 mb-3 text-sm">{product.description}</p>
                )}
                
                {/* Rating */}
                <div className="flex items-center space-x-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-400 ml-1">({product.rating})</span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-gray-100">${product.price}</span>
                    {product.originalPrice && (
                      <span className="text-lg text-gray-500 line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>
                  <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 transform hover:-translate-y-0.5">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
