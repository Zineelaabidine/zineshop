import express, { Request, Response } from 'express';
import { query } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// Product interface for public API
interface PublicProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  stock: number;
  category_name: string | null;
  created_at: string;
  average_rating: number | null;
  review_count: number;
}

// Response interfaces
interface ProductsResponse {
  success: boolean;
  message: string;
  data?: {
    products: PublicProduct[];
    totalCount: number;
  };
}

interface FeaturedProductsResponse {
  success: boolean;
  message: string;
  data?: {
    products: PublicProduct[];
  };
}

interface ProductDetailResponse {
  success: boolean;
  message: string;
  data?: {
    product: PublicProduct;
  };
}

// @route   GET /api/products
// @desc    Get all products (public endpoint)
// @access  Public
router.get('/', asyncHandler(async (req: Request, res: Response<ProductsResponse>) => {
  try {
    const {
      search = '',
      category = 'all',
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build WHERE clause for filtering
    let whereConditions: string[] = ['p.stock > 0']; // Only show products in stock
    let queryParams: any[] = [];
    let paramIndex = 1;

    // Search filter
    if (search && typeof search === 'string' && search.trim() !== '') {
      whereConditions.push(`(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`);
      queryParams.push(`%${search.trim()}%`);
      paramIndex++;
    }

    // Category filter
    if (category && typeof category === 'string' && category !== 'all') {
      whereConditions.push(`p.category_id = $${paramIndex}`);
      queryParams.push(category);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Build ORDER BY clause
    const validSortFields = ['name', 'price', 'created_at'];
    const validSortOrders = ['asc', 'desc'];
    
    const sortField = validSortFields.includes(sortBy as string) ? sortBy : 'created_at';
    const sortDirection = validSortOrders.includes(sortOrder as string) ? sortOrder : 'desc';
    const orderClause = `ORDER BY p.${sortField} ${sortDirection}`;

    // Pagination
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 20));
    const offset = (pageNum - 1) * limitNum;

    // Main query to get products with category and rating information
    const productsQuery = `
      SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.image_url,
        p.stock,
        p.created_at,
        c.name as category_name,
        prs.average_rating,
        COALESCE(prs.total_reviews, 0) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_ratings_summary prs ON p.id = prs.product_id
      ${whereClause}
      ${orderClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limitNum, offset);

    // Count query for total results
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_ratings_summary prs ON p.id = prs.product_id
      ${whereClause}
    `;

    const countParams = queryParams.slice(0, -2); // Remove limit and offset for count query

    // Execute both queries
    const [productsResult, countResult] = await Promise.all([
      query(productsQuery, queryParams),
      query(countQuery, countParams)
    ]);

    const products: PublicProduct[] = productsResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      image_url: row.image_url,
      stock: parseInt(row.stock),
      category_name: row.category_name,
      created_at: row.created_at,
      average_rating: row.average_rating ? parseFloat(row.average_rating) : null,
      review_count: parseInt(row.review_count) || 0
    }));

    const totalCount = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products,
        totalCount
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching products'
    });
  }
}));

// @route   GET /api/products/featured
// @desc    Get featured products for home page (public endpoint)
// @access  Public
router.get('/featured', asyncHandler(async (req: Request, res: Response<FeaturedProductsResponse>) => {
  try {
    const limit = parseInt(req.query.limit as string) || 6;

    // Get featured products (latest products with images, in stock)
    const featuredQuery = `
      SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.image_url,
        p.stock,
        p.created_at,
        c.name as category_name,
        prs.average_rating,
        COALESCE(prs.total_reviews, 0) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_ratings_summary prs ON p.id = prs.product_id
      WHERE p.stock > 0 AND p.image_url IS NOT NULL AND p.image_url != ''
      ORDER BY p.created_at DESC
      LIMIT $1
    `;

    const result = await query(featuredQuery, [limit]);

    const products: PublicProduct[] = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      image_url: row.image_url,
      stock: parseInt(row.stock),
      category_name: row.category_name,
      created_at: row.created_at,
      average_rating: row.average_rating ? parseFloat(row.average_rating) : null,
      review_count: parseInt(row.review_count) || 0
    }));



    res.json({
      success: true,
      message: 'Featured products retrieved successfully',
      data: {
        products
      }
    });

  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching featured products'
    });
  }
}));

// @route   GET /api/products/categories
// @desc    Get all categories (public endpoint)
// @access  Public
router.get('/categories', asyncHandler(async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT id, name, created_at FROM categories ORDER BY name ASC'
    );

    const categories = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      created_at: row.created_at
    }));

    res.json({
      success: true,
      message: 'Categories retrieved successfully',
      data: {
        categories
      }
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching categories'
    });
  }
}));

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', asyncHandler(async (req: Request, res: Response<ProductDetailResponse>) => {
  try {
    const { id } = req.params;

    // Validate product ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    // Get product with category and rating information
    const productQuery = `
      SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.image_url,
        p.stock,
        p.created_at,
        c.name as category_name,
        prs.average_rating,
        COALESCE(prs.total_reviews, 0) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_ratings_summary prs ON p.id = prs.product_id
      WHERE p.id = $1
    `;

    const result = await query(productQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const productRow = result.rows[0];
    const product: PublicProduct = {
      id: productRow.id,
      name: productRow.name,
      description: productRow.description,
      price: parseFloat(productRow.price),
      image_url: productRow.image_url,
      stock: parseInt(productRow.stock),
      category_name: productRow.category_name,
      created_at: productRow.created_at,
      average_rating: productRow.average_rating ? parseFloat(productRow.average_rating) : null,
      review_count: parseInt(productRow.review_count) || 0
    };

    return res.json({
      success: true,
      message: 'Product retrieved successfully',
      data: {
        product
      }
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching product'
    });
  }
}));

export default router;
