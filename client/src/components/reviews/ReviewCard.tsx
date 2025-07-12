import React from 'react';
import { User, Calendar } from 'lucide-react';
import { ReviewCardProps, formatRelativeDate, renderStars } from '../../types/reviews';

const ReviewCard: React.FC<ReviewCardProps> = ({ review, className = '' }) => {
  const stars = renderStars(review.rating);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* User Avatar */}
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-indigo-600" />
          </div>
          
          {/* User Info */}
          <div>
            <h4 className="font-medium text-gray-900">
              {review.user_name || 'Anonymous User'}
            </h4>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{formatRelativeDate(review.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          {stars.map((star, index) => (
            <span key={index} className="text-lg">
              {star}
            </span>
          ))}
        </div>
      </div>

      {/* Review Content */}
      {review.review && (
        <div className="mt-4">
          <p className="text-gray-700 leading-relaxed">
            {review.review}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Rated {review.rating} out of 5 stars
          </span>
          {review.updated_at !== review.created_at && (
            <span className="italic">
              Edited
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
