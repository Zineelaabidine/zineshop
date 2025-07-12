import React, { useState } from 'react';
import { Star, MessageSquare, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import StarRatingInput from './StarRatingInput';
import {
  ReviewFormProps,
  ReviewFormState,
  CreateReviewRequest,
  CreateReviewResponse,
  validateReview,
  REVIEW_CONSTANTS
} from '../../types/reviews';

const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  onReviewSubmitted,
  onCancel,
  className = ''
}) => {
  const { user } = useAuth();
  const [formState, setFormState] = useState<ReviewFormState>({
    rating: 0,
    comment: '',
    isSubmitting: false,
    errors: {}
  });

  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleRatingChange = (rating: number) => {
    setFormState(prev => ({
      ...prev,
      rating,
      errors: { ...prev.errors, rating: undefined }
    }));
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const comment = e.target.value;
    setFormState(prev => ({
      ...prev,
      comment,
      errors: { ...prev.errors, comment: undefined }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setFormState(prev => ({
        ...prev,
        errors: { general: 'You must be logged in to submit a review' }
      }));
      return;
    }

    // Validate form
    const validation = validateReview(formState.rating, formState.comment);
    if (!validation.isValid) {
      setFormState(prev => ({
        ...prev,
        errors: validation.errors
      }));
      return;
    }

    setFormState(prev => ({ ...prev, isSubmitting: true, errors: {} }));
    setSuccessMessage('');

    try {
      const reviewData: CreateReviewRequest = {
        product_id: productId,
        rating: formState.rating,
        review: formState.comment.trim() || undefined
      };

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
      });

      const data: CreateReviewResponse = await response.json();

      if (data.success && data.data) {
        setSuccessMessage('Review submitted successfully!');
        setFormState({
          rating: 0,
          comment: '',
          isSubmitting: false,
          errors: {}
        });
        
        // Call the callback with the new review
        onReviewSubmitted(data.data.review);
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setFormState(prev => ({
          ...prev,
          isSubmitting: false,
          errors: { general: data.message || 'Failed to submit review' }
        }));
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        errors: { general: 'Network error. Please try again.' }
      }));
    }
  };

  const handleCancel = () => {
    setFormState({
      rating: 0,
      comment: '',
      isSubmitting: false,
      errors: {}
    });
    setSuccessMessage('');
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
          <Star className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Write a Review</h3>
          <p className="text-sm text-gray-600">Share your experience with this product</p>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800">{successMessage}</span>
        </div>
      )}

      {/* General Error */}
      {formState.errors.general && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{formState.errors.general}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Rating *
          </label>
          <StarRatingInput
            rating={formState.rating}
            onRatingChange={handleRatingChange}
            size="lg"
            disabled={formState.isSubmitting}
          />
          {formState.errors.rating && (
            <p className="mt-2 text-sm text-red-600">{formState.errors.rating}</p>
          )}
        </div>

        {/* Comment Input */}
        <div>
          <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-3">
            Review Comment (Optional)
          </label>
          <div className="relative">
            <MessageSquare className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
            <textarea
              id="review-comment"
              value={formState.comment}
              onChange={handleCommentChange}
              disabled={formState.isSubmitting}
              placeholder="Tell others about your experience with this product..."
              rows={4}
              maxLength={REVIEW_CONSTANTS.MAX_COMMENT_LENGTH}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>
          <div className="mt-2 flex justify-between text-sm text-gray-500">
            <span>
              {formState.errors.comment && (
                <span className="text-red-600">{formState.errors.comment}</span>
              )}
            </span>
            <span>
              {formState.comment.length}/{REVIEW_CONSTANTS.MAX_COMMENT_LENGTH}
            </span>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={formState.isSubmitting || formState.rating === 0}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {formState.isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Star className="w-4 h-4" />
                Submit Review
              </>
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={formState.isSubmitting}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
