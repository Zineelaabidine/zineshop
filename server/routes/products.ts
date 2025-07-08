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
      whereConditions.push(`c.name ILIKE $${paramIndex}`);
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

    // Main query to get products with category information
    const productsQuery = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.image_url,
        p.stock,
        p.created_at,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
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
      created_at: row.created_at
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
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
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
      created_at: row.created_at
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

export default router;
