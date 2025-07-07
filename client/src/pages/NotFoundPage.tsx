import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Search, AlertTriangle } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-8">
        {/* 404 Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold">
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              404
            </span>
          </h1>
          <h2 className="text-2xl font-semibold text-white">
            Page Not Found
          </h2>
          <p className="text-gray-400 text-lg">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            to="/"
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-200"
          >
            <Home className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          
          <Link
            to="/products"
            className="w-full flex items-center justify-center space-x-2 bg-gray-800 text-gray-300 px-6 py-3 rounded-lg font-medium border border-gray-700 hover:bg-gray-700 hover:text-white transition-all duration-200"
          >
            <Search className="w-5 h-5" />
            <span>Browse Products</span>
          </Link>
        </div>

        {/* Back Link */}
        <div className="pt-4">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center space-x-2 text-gray-400 hover:text-indigo-400 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
