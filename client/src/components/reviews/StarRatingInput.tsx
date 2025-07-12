import React, { useState } from 'react';
import { StarRatingInputProps, getStarSizeClasses, getRatingText } from '../../types/reviews';

const StarRatingInput: React.FC<StarRatingInputProps> = ({
  rating,
  onRatingChange,
  size = 'md',
  disabled = false,
  className = ''
}) => {
  const [hoverRating, setHoverRating] = useState<number>(0);
  
  const sizeClasses = getStarSizeClasses(size);
  const currentRating = hoverRating || rating;

  const handleStarClick = (starRating: number) => {
    if (!disabled) {
      onRatingChange(starRating);
    }
  };

  const handleStarHover = (starRating: number) => {
    if (!disabled) {
      setHoverRating(starRating);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled) {
      setHoverRating(0);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Stars */}
      <div 
        className="flex items-center gap-1"
        onMouseLeave={handleMouseLeave}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
            disabled={disabled}
            className={`
              ${sizeClasses}
              transition-all duration-200
              ${disabled 
                ? 'cursor-not-allowed opacity-50' 
                : 'cursor-pointer hover:scale-110 focus:scale-110 focus:outline-none'
              }
              ${star <= currentRating 
                ? 'text-yellow-400' 
                : 'text-gray-300 hover:text-yellow-200'
              }
            `}
            aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
          >
            {star <= currentRating ? '⭐️' : '☆'}
          </button>
        ))}
      </div>

      {/* Rating text */}
      {currentRating > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">
            {currentRating} star{currentRating !== 1 ? 's' : ''}
          </span>
          <span className="text-sm text-gray-600">
            ({getRatingText(currentRating)})
          </span>
        </div>
      )}
    </div>
  );
};

export default StarRatingInput;
