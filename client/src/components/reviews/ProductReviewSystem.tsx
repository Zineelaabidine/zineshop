import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, ShoppingBag, LogIn, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import {
  Review,
  ReviewsResponse,
  PurchaseEligibilityResponse,
  ReviewEligibilityState,
  ReviewListState,
  REVIEW_CONSTANTS
} from '../../types/reviews';

interface ProductReviewSystemProps {
  productId: string;
  productName: string;
  averageRating: number | null;
  reviewCount: number;
  className?: string;
}

const ProductReviewSystem: React.FC<ProductReviewSystemProps> = ({
  productId,
  productName,
  averageRating,
  reviewCount,
  className = ''
}) => {
  const { user } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  const [eligibilityState, setEligibilityState] = useState<ReviewEligibilityState>({
    isLoading: false,
    canReview: false,
    hasPurchased: false,
    hasReviewed: false
  });

  const [reviewListState, setReviewListState] = useState<ReviewListState>({
    reviews: [],
    isLoading: true,
    isLoadingMore: false,
    hasMore: false,
    totalCount: 0,
    averageRating: averageRating || 0,
    currentPage: 1
  });

  // Fetch reviews
  const fetchReviews = async (page: number = 1, append: boolean = false) => {
    try {
      if (append) {
        setReviewListState(prev => ({ ...prev, isLoadingMore: true }));
      } else {
        setReviewListState(prev => ({ ...prev, isLoading: true }));
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: REVIEW_CONSTANTS.REVIEWS_PER_PAGE.toString(),
        sortBy: 'created_at',
        sortOrder: 'desc'
      });

      const response = await fetch(`http://localhost:5000/api/reviews/product/${productId}?${params}`);
      const data: ReviewsResponse = await response.json();

      if (data.success && data.data) {
        setReviewListState(prev => ({
          ...prev,
          reviews: append ? [...prev.reviews, ...data.data!.reviews] : data.data!.reviews,
          totalCount: data.data!.totalCount,
          averageRating: data.data!.averageRating,
          hasMore: data.data!.reviews.length === REVIEW_CONSTANTS.REVIEWS_PER_PAGE,
          currentPage: page,
          isLoading: false,
          isLoadingMore: false
        }));
      } else {
        setReviewListState(prev => ({
          ...prev,
          error: data.message || 'Failed to load reviews',
          isLoading: false,
          isLoadingMore: false
        }));
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviewListState(prev => ({
        ...prev,
        error: 'Network error. Please try again.',
        isLoading: false,
        isLoadingMore: false
      }));
    }
  };

  // Check review eligibility
  const checkEligibility = async () => {
    if (!user) {
      setEligibilityState({
        isLoading: false,
        canReview: false,
        hasPurchased: false,
        hasReviewed: false
      });
      return;
    }

    try {
      setEligibilityState(prev => ({ ...prev, isLoading: true }));

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/reviews/eligibility/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data: PurchaseEligibilityResponse = await response.json();

      if (data.success && data.data) {
        setEligibilityState({
          isLoading: false,
          canReview: data.data.canReview,
          hasPurchased: data.data.hasPurchased,
          hasReviewed: data.data.hasReviewed,
          existingReview: data.data.existingReview
        });
      } else {
        setEligibilityState(prev => ({
          ...prev,
          isLoading: false,
          error: data.message || 'Failed to check eligibility'
        }));
      }
    } catch (error) {
      console.error('Error checking eligibility:', error);
      setEligibilityState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Network error. Please try again.'
      }));
    }
  };

  // Handle review submission
  const handleReviewSubmitted = (newReview: Review) => {
    // Add the new review to the top of the list
    setReviewListState(prev => ({
      ...prev,
      reviews: [newReview, ...prev.reviews],
      totalCount: prev.totalCount + 1
    }));

    // Update eligibility state
    setEligibilityState(prev => ({
      ...prev,
      hasReviewed: true,
      canReview: false,
      existingReview: newReview
    }));

    // Hide the form
    setShowReviewForm(false);
  };

  // Load more reviews
  const handleLoadMore = () => {
    fetchReviews(reviewListState.currentPage + 1, true);
  };

  // Load data on component mount
  useEffect(() => {
    fetchReviews();
    checkEligibility();
  }, [productId, user]);

  const renderReviewPrompt = () => {
    if (!user) {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <LogIn className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Sign in to leave a review
              </h3>
              <p className="text-blue-700 mb-4">
                Share your experience with {productName} by creating an account or signing in.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
            </div>
          </div>
        </div>
      );
    }

    if (eligibilityState.isLoading) {
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
            <span className="text-gray-600">Checking review eligibility...</span>
          </div>
        </div>
      );
    }

    if (eligibilityState.hasReviewed && eligibilityState.existingReview) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-900 mb-1">
                Thank you for your review!
              </h3>
              <p className="text-green-700">
                You've already reviewed this product. Your review helps other customers make informed decisions.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (!eligibilityState.hasPurchased) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-900 mb-1">
                Purchase required to review
              </h3>
              <p className="text-yellow-700">
                You can only rate and review products after purchasing them. This helps ensure authentic reviews.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (eligibilityState.canReview) {
      return (
        <div className="space-y-4">
          {!showReviewForm ? (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-indigo-900 mb-1">
                      Share your experience
                    </h3>
                    <p className="text-indigo-700">
                      Help other customers by rating and reviewing {productName}.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                >
                  Write Review
                </button>
              </div>
            </div>
          ) : (
            <ReviewForm
              productId={productId}
              onReviewSubmitted={handleReviewSubmitted}
              onCancel={() => setShowReviewForm(false)}
            />
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Section Header */}
      <div className="border-b border-gray-200 pb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Reviews</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="text-lg">
                  {star <= Math.round(reviewListState.averageRating) ? '⭐️' : '☆'}
                </span>
              ))}
            </div>
            <span className="text-lg font-semibold text-gray-900">
              {reviewListState.averageRating.toFixed(1)}
            </span>
          </div>
          <span className="text-gray-600">
            Based on {reviewListState.totalCount} review{reviewListState.totalCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Review Prompt */}
      {renderReviewPrompt()}

      {/* Error Message */}
      {reviewListState.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{reviewListState.error}</span>
        </div>
      )}

      {/* Reviews List */}
      <ReviewList
        productId={productId}
        reviews={reviewListState.reviews}
        isLoading={reviewListState.isLoading || reviewListState.isLoadingMore}
        onLoadMore={reviewListState.hasMore ? handleLoadMore : undefined}
        hasMore={reviewListState.hasMore}
      />
    </div>
  );
};

export default ProductReviewSystem;
