import express, { Request, Response } from 'express';
import { query } from '../config/database';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// Review interfaces
interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  review: string | null;
  created_at: string;
  updated_at: string;
  user_name: string;
}

interface CreateReviewRequest {
  product_id: string;
  rating: number;
  review?: string;
}

interface ReviewsResponse {
  success: boolean;
  message: string;
  data?: {
    reviews: Review[];
    totalCount: number;
    averageRating: number;
  };
}

interface CreateReviewResponse {
  success: boolean;
  message: string;
  data?: {
    review: Review;
  };
}

interface PurchaseEligibilityResponse {
  success: boolean;
  message: string;
  data?: {
    canReview: boolean;
    hasPurchased: boolean;
    hasReviewed: boolean;
    existingReview?: Review;
  };
}

// @route   GET /api/reviews/product/:productId
// @desc    Get all reviews for a product
// @access  Public
router.get('/product/:productId', asyncHandler(async (req: Request, res: Response<ReviewsResponse>) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    // Validate product ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(productId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
      return;
    }

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 10));
    const offset = (pageNum - 1) * limitNum;

    // Validate sort parameters
    const validSortColumns = ['created_at', 'rating'];
    const validSortOrders = ['asc', 'desc'];
    const safeSortBy = validSortColumns.includes(sortBy as string) ? sortBy : 'created_at';
    const safeSortOrder = validSortOrders.includes(sortOrder as string) ? sortOrder : 'desc';

    // Get reviews with user information
    const reviewsQuery = `
      SELECT 
        pr.id,
        pr.user_id,
        pr.product_id,
        pr.rating,
        pr.review,
        pr.created_at,
        pr.updated_at,
        u.full_name as user_name
      FROM product_reviews pr
      LEFT JOIN users u ON pr.user_id = u.id
      WHERE pr.product_id = $1
      ORDER BY pr.${safeSortBy} ${safeSortOrder}
      LIMIT $2 OFFSET $3
    `;

    const reviewsResult = await query(reviewsQuery, [productId, limitNum, offset]);

    // Get total count and average rating
    const statsQuery = `
      SELECT 
        COUNT(*) as total_count,
        COALESCE(AVG(rating), 0) as average_rating
      FROM product_reviews 
      WHERE product_id = $1
    `;

    const statsResult = await query(statsQuery, [productId]);
    const stats = statsResult.rows[0];

    res.json({
      success: true,
      message: 'Reviews retrieved successfully',
      data: {
        reviews: reviewsResult.rows,
        totalCount: parseInt(stats.total_count),
        averageRating: parseFloat(stats.average_rating)
      }
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching reviews'
    });
  }
}));

// @route   GET /api/reviews/eligibility/:productId
// @desc    Check if user can review a product (purchase verification)
// @access  Private
router.get('/eligibility/:productId', authenticateToken, asyncHandler(async (req: Request, res: Response<PurchaseEligibilityResponse>) => {
  try {
    const { productId } = req.params;
    const userId = req.user!.id;

    // Validate product ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(productId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
      return;
    }

    // Check if user has purchased this product (from completed orders)
    const purchaseQuery = `
      SELECT DISTINCT o.id
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1 
        AND oi.product_id = $2 
        AND o.status IN ('paid', 'shipped')
    `;

    const purchaseResult = await query(purchaseQuery, [userId, productId]);
    const hasPurchased = purchaseResult.rows.length > 0;

    // Check if user has already reviewed this product
    const reviewQuery = `
      SELECT 
        pr.id,
        pr.user_id,
        pr.product_id,
        pr.rating,
        pr.review,
        pr.created_at,
        pr.updated_at,
        u.full_name as user_name
      FROM product_reviews pr
      LEFT JOIN users u ON pr.user_id = u.id
      WHERE pr.user_id = $1 AND pr.product_id = $2
    `;

    const reviewResult = await query(reviewQuery, [userId, productId]);
    const hasReviewed = reviewResult.rows.length > 0;
    const existingReview = hasReviewed ? reviewResult.rows[0] : undefined;

    // User can review if they have purchased and haven't reviewed yet
    const canReview = hasPurchased && !hasReviewed;

    res.json({
      success: true,
      message: 'Eligibility checked successfully',
      data: {
        canReview,
        hasPurchased,
        hasReviewed,
        existingReview
      }
    });

  } catch (error) {
    console.error('Error checking review eligibility:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while checking eligibility'
    });
  }
}));

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private
router.post('/', authenticateToken, asyncHandler(async (req: Request, res: Response<CreateReviewResponse>) => {
  try {
    const { product_id, rating, review }: CreateReviewRequest = req.body;
    const userId = req.user!.id;

    // Validate required fields
    if (!product_id || !rating) {
      res.status(400).json({
        success: false,
        message: 'Product ID and rating are required'
      });
      return;
    }

    // Validate rating range
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5'
      });
      return;
    }

    // Validate product ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(product_id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
      return;
    }

    // Check if product exists
    const productResult = await query('SELECT id FROM products WHERE id = $1', [product_id]);
    if (productResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }

    // Check purchase eligibility
    const purchaseQuery = `
      SELECT DISTINCT o.id
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1 
        AND oi.product_id = $2 
        AND o.status IN ('paid', 'shipped')
    `;

    const purchaseResult = await query(purchaseQuery, [userId, product_id]);
    if (purchaseResult.rows.length === 0) {
      res.status(403).json({
        success: false,
        message: 'You can only review products you have purchased'
      });
      return;
    }

    // Check if user has already reviewed this product
    const existingReviewResult = await query(
      'SELECT id FROM product_reviews WHERE user_id = $1 AND product_id = $2',
      [userId, product_id]
    );

    if (existingReviewResult.rows.length > 0) {
      res.status(409).json({
        success: false,
        message: 'You have already reviewed this product'
      });
      return;
    }

    // Create the review
    const insertQuery = `
      INSERT INTO product_reviews (user_id, product_id, rating, review)
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_id, product_id, rating, review, created_at, updated_at
    `;

    const insertResult = await query(insertQuery, [userId, product_id, rating, review || null]);
    const newReview = insertResult.rows[0];

    // Get user name for response
    const userResult = await query('SELECT full_name FROM users WHERE id = $1', [userId]);
    const userName = userResult.rows[0]?.full_name || 'Anonymous';

    const reviewWithUserName = {
      ...newReview,
      user_name: userName
    };

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: {
        review: reviewWithUserName
      }
    });

  } catch (error) {
    console.error('Error creating review:', error);
    
    // Handle unique constraint violation (duplicate review)
    if (error instanceof Error && error.message.includes('one_review_per_user')) {
      res.status(409).json({
        success: false,
        message: 'You have already reviewed this product'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while creating review'
    });
  }
}));

export default router;
