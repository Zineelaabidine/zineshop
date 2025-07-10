import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';

interface ProductImageCarouselProps {
  images: string[];
  productName: string;
  className?: string;
}

const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({ 
  images, 
  productName, 
  className = '' 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<number>>(new Set());

  // Handle image load error
  const handleImageError = (index: number) => {
    setImageLoadErrors(prev => new Set([...prev, index]));
  };

  // Navigate to previous image
  const goToPrevious = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  // Navigate to next image
  const goToNext = () => {
    setCurrentImageIndex(prev => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  // Navigate to specific image
  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Filter out valid images (not errored and not empty)
  const validImages = images.filter((img, index) => 
    img && img.trim() !== '' && !imageLoadErrors.has(index)
  );

  // If no valid images, show placeholder
  if (validImages.length === 0) {
    return (
      <div className={`relative ${className}`}>
        <div className="aspect-square bg-gray-800 rounded-2xl flex items-center justify-center border border-gray-700">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No Image Available</p>
          </div>
        </div>
      </div>
    );
  }

  const currentImage = images[currentImageIndex];
  const hasMultipleImages = validImages.length > 1;

  return (
    <div className={`relative ${className}`}>
      {/* Main Image Display */}
      <div className="relative aspect-square bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 group">
        {!imageLoadErrors.has(currentImageIndex) ? (
          <img
            src={currentImage}
            alt={`${productName} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => handleImageError(currentImageIndex)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Image not available</p>
            </div>
          </div>
        )}

        {/* Navigation Arrows (only show if multiple images) */}
        {hasMultipleImages && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {hasMultipleImages && (
          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation (only show if multiple images) */}
      {hasMultipleImages && (
        <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === currentImageIndex
                  ? 'border-blue-500 ring-2 ring-blue-500/30'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              {!imageLoadErrors.has(index) ? (
                <img
                  src={image}
                  alt={`${productName} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(index)}
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Keyboard Navigation Hint */}
      {hasMultipleImages && (
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-500">
            Use arrow keys or click thumbnails to navigate
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductImageCarousel;
