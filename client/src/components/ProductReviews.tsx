import React, { useState } from 'react';
import { Star, MessageSquare, ThumbsUp, User } from 'lucide-react';
import ProductRating from './ProductRating';

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  helpful: number;
  verified: boolean;
}

interface ProductReviewsProps {
  productId: string;
  averageRating: number | null;
  reviewCount: number;
  className?: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId,
  averageRating,
  reviewCount,
  className = ''
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showWriteReview, setShowWriteReview] = useState(false);

  // Mock reviews data for demonstration
  const mockReviews: Review[] = [
    {
      id: '1',
      userId: 'user1',
      userName: 'John D.',
      rating: 5,
      title: 'Excellent product!',
      comment: 'This product exceeded my expectations. Great quality and fast shipping. Highly recommended!',
      createdAt: '2024-01-15T10:30:00Z',
      helpful: 12,
      verified: true
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Sarah M.',
      rating: 4,
      title: 'Good value for money',
      comment: 'Overall satisfied with the purchase. The product works as described, though the packaging could be better.',
      createdAt: '2024-01-10T14:20:00Z',
      helpful: 8,
      verified: true
    },
    {
      id: '3',
      userId: 'user3',
      userName: 'Mike R.',
      rating: 3,
      title: 'Average product',
      comment: 'It\'s okay, but nothing special. Does what it\'s supposed to do.',
      createdAt: '2024-01-05T09:15:00Z',
      helpful: 3,
      verified: false
    }
  ];

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Render star rating for individual review
  const renderReviewStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  // Calculate rating distribution
  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    mockReviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const ratingDistribution = getRatingDistribution();
  const totalReviews = mockReviews.length;

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Reviews Header */}
      <div className="border-b border-gray-700 pb-6">
        <h2 className="text-2xl font-bold text-gray-100 mb-4">Customer Reviews</h2>
        
        {/* Overall Rating Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Rating Overview */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-100">
                  {averageRating ? averageRating.toFixed(1) : 'N/A'}
                </div>
                <ProductRating 
                  averageRating={averageRating}
                  reviewCount={reviewCount}
                  size="md"
                />
              </div>
              <div className="text-gray-400">
                <p>Based on {reviewCount} review{reviewCount !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingDistribution[rating as keyof typeof ratingDistribution];
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center space-x-3">
                  <span className="text-sm text-gray-400 w-8">{rating}★</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-400 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Write Review Button */}
        <div className="mt-6">
          <button
            onClick={() => setShowWriteReview(!showWriteReview)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <MessageSquare className="w-5 h-5" />
            <span>Write a Review</span>
          </button>
        </div>
      </div>

      {/* Write Review Form */}
      {showWriteReview && (
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-100">Write Your Review</h3>
          <div className="text-gray-400 text-sm">
            Share your experience with this product to help other customers.
          </div>
          
          {/* Placeholder for review form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rating
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} className="text-gray-600 hover:text-yellow-400 transition-colors">
                    <Star className="w-6 h-6" />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Review Title
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Summarize your review..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Review
              </label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell others about your experience with this product..."
              />
            </div>
            
            <div className="flex space-x-3">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200">
                Submit Review
              </button>
              <button
                onClick={() => setShowWriteReview(false)}
                className="bg-gray-600 hover:bg-gray-700 text-gray-300 px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-100">
          Reviews ({totalReviews})
        </h3>
        
        {mockReviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No reviews yet</p>
            <p className="text-gray-500">Be the first to review this product!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {mockReviews.map((review) => (
              <div key={review.id} className="bg-gray-800 rounded-lg p-6">
                {/* Review Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-200">{review.userName}</span>
                        {review.verified && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        {renderReviewStars(review.rating)}
                        <span className="text-sm text-gray-400">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Review Content */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-100">{review.title}</h4>
                  <p className="text-gray-300 leading-relaxed">{review.comment}</p>
                </div>

                {/* Review Actions */}
                <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-700">
                  <button className="flex items-center space-x-2 text-gray-400 hover:text-gray-300 transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm">Helpful ({review.helpful})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
