import React from 'react';
import { Loader2, MessageSquare, AlertCircle } from 'lucide-react';
import ReviewCard from './ReviewCard';
import { ReviewListProps } from '../../types/reviews';

const ReviewList: React.FC<ReviewListProps> = ({
  productId,
  reviews,
  isLoading = false,
  onLoadMore,
  hasMore = false,
  className = ''
}) => {
  if (isLoading && reviews.length === 0) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-600">
              Be the first to share your experience with this product!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && onLoadMore && (
        <div className="text-center pt-6">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4" />
                Load More Reviews
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
