import React from 'react';

interface ProductRatingProps {
  averageRating: number | null;
  reviewCount: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ProductRating: React.FC<ProductRatingProps> = ({ 
  averageRating, 
  reviewCount, 
  className = '',
  size = 'md'
}) => {
  // Size configurations
  const sizeConfig = {
    sm: {
      starSize: 'text-sm',
      textSize: 'text-xs',
      spacing: 'space-x-1'
    },
    md: {
      starSize: 'text-base',
      textSize: 'text-sm',
      spacing: 'space-x-1'
    },
    lg: {
      starSize: 'text-lg',
      textSize: 'text-base',
      spacing: 'space-x-2'
    }
  };

  const config = sizeConfig[size];

  // If no rating or no reviews, show "New product" message
  if (averageRating === null || reviewCount === 0) {
    return (
      <div className={`flex items-center ${config.spacing} ${className}`}>
        <span className={`text-gray-500 italic ${config.textSize}`}>
          New product – no ratings yet
        </span>
      </div>
    );
  }

  // Round rating to nearest integer for star display
  const roundedRating = Math.round(averageRating);
  
  // Generate star display
  const renderStars = () => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        // Filled star
        stars.push(
          <span key={i} className={`${config.starSize}`}>
            ⭐️
          </span>
        );
      } else {
        // Empty star
        stars.push(
          <span key={i} className={`${config.starSize}`}>
            ☆
          </span>
        );
      }
    }
    
    return stars;
  };

  return (
    <div className={`flex items-center ${config.spacing} ${className}`}>
      {/* Stars */}
      <div className="flex items-center">
        {renderStars()}
      </div>
      
      {/* Review count */}
      <span className={`text-gray-400 ${config.textSize}`}>
        ({reviewCount})
      </span>
      
      {/* Optional: Show exact rating on hover */}
      <span 
        className={`text-gray-500 ${config.textSize} hidden group-hover:inline ml-1`}
        title={`Average rating: ${averageRating.toFixed(1)} out of 5`}
      >
        {averageRating.toFixed(1)}
      </span>
    </div>
  );
};

export default ProductRating;
