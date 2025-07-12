// ===============================================
// REVIEW SYSTEM TYPES - CLIENT SIDE
// ===============================================

// Core review interface
export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  review: string | null;
  created_at: string;
  updated_at: string;
  user_name: string;
}

// Review creation request
export interface CreateReviewRequest {
  product_id: string;
  rating: number;
  review?: string;
}

// API Response interfaces
export interface ReviewsResponse {
  success: boolean;
  message: string;
  data?: {
    reviews: Review[];
    totalCount: number;
    averageRating: number;
  };
}

export interface CreateReviewResponse {
  success: boolean;
  message: string;
  data?: {
    review: Review;
  };
}

export interface PurchaseEligibilityResponse {
  success: boolean;
  message: string;
  data?: {
    canReview: boolean;
    hasPurchased: boolean;
    hasReviewed: boolean;
    existingReview?: Review;
  };
}

// Component prop interfaces
export interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: (review: Review) => void;
  onCancel?: () => void;
  className?: string;
}

export interface ReviewListProps {
  productId: string;
  reviews: Review[];
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
}

export interface ReviewCardProps {
  review: Review;
  className?: string;
}

export interface StarRatingInputProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export interface StarRatingDisplayProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  className?: string;
}

export interface ReviewStatsProps {
  averageRating: number;
  totalReviews: number;
  ratingDistribution?: RatingDistribution;
  className?: string;
}

export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

// Review form state
export interface ReviewFormState {
  rating: number;
  comment: string;
  isSubmitting: boolean;
  errors: {
    rating?: string;
    comment?: string;
    general?: string;
  };
}

// Review eligibility state
export interface ReviewEligibilityState {
  isLoading: boolean;
  canReview: boolean;
  hasPurchased: boolean;
  hasReviewed: boolean;
  existingReview?: Review;
  error?: string;
}

// Review list state
export interface ReviewListState {
  reviews: Review[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  totalCount: number;
  averageRating: number;
  currentPage: number;
  error?: string;
}

// Utility functions
export const formatReviewDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
};

export const getRatingText = (rating: number): string => {
  switch (rating) {
    case 1:
      return 'Poor';
    case 2:
      return 'Fair';
    case 3:
      return 'Good';
    case 4:
      return 'Very Good';
    case 5:
      return 'Excellent';
    default:
      return 'Unknown';
  }
};

export const validateReview = (rating: number, comment: string): { isValid: boolean; errors: Partial<ReviewFormState['errors']> } => {
  const errors: Partial<ReviewFormState['errors']> = {};

  if (!rating || rating < 1 || rating > 5) {
    errors.rating = 'Please select a rating between 1 and 5 stars';
  }

  if (comment && comment.length > 1000) {
    errors.comment = 'Review comment must be less than 1000 characters';
  }

  if (comment && comment.trim().length < 10) {
    errors.comment = 'Review comment must be at least 10 characters long';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Star rating utilities
export const renderStars = (rating: number, maxRating: number = 5): string[] => {
  const stars: string[] = [];
  
  for (let i = 1; i <= maxRating; i++) {
    if (i <= rating) {
      stars.push('⭐️'); // Filled star
    } else {
      stars.push('☆'); // Empty star
    }
  }
  
  return stars;
};

export const getStarSizeClasses = (size: 'sm' | 'md' | 'lg'): string => {
  switch (size) {
    case 'sm':
      return 'text-sm';
    case 'md':
      return 'text-base';
    case 'lg':
      return 'text-xl';
    default:
      return 'text-base';
  }
};

// Review sorting options
export type ReviewSortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

export const getReviewSortParams = (sortOption: ReviewSortOption): { sortBy: string; sortOrder: string } => {
  switch (sortOption) {
    case 'newest':
      return { sortBy: 'created_at', sortOrder: 'desc' };
    case 'oldest':
      return { sortBy: 'created_at', sortOrder: 'asc' };
    case 'highest':
      return { sortBy: 'rating', sortOrder: 'desc' };
    case 'lowest':
      return { sortBy: 'rating', sortOrder: 'asc' };
    default:
      return { sortBy: 'created_at', sortOrder: 'desc' };
  }
};

// Constants
export const REVIEW_CONSTANTS = {
  MIN_RATING: 1,
  MAX_RATING: 5,
  MIN_COMMENT_LENGTH: 10,
  MAX_COMMENT_LENGTH: 1000,
  REVIEWS_PER_PAGE: 10,
  MAX_REVIEWS_PER_PAGE: 50
} as const;
