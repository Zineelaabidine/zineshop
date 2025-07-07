import express, { Request, Response } from 'express';
import { query } from '../config/database';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import {
  AdminProductsResponse,
  AdminCategoriesResponse,
  AdminStatsResponse,
  AdminDeleteProductResponse,
  ProductsQueryParams,
  ProductWithCategory,
  Category,
  AdminStats,
  getProductStatus
} from '../types/admin';

const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// @route   GET /api/admin/products
// @desc    Get all products with filtering and pagination
// @access  Private (Admin only)
router.get('/products', asyncHandler(async (req: Request, res: Response<AdminProductsResponse>) => {
  const {
    search = '',
    category = 'all',
    status = 'all',
    page = 1,
    limit = 50,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = req.query as Partial<ProductsQueryParams>;

  // Build WHERE clause for filtering
  let whereConditions: string[] = [];
  let queryParams: any[] = [];
  let paramIndex = 1;

  // Search filter
  if (search && search.trim() !== '') {
    whereConditions.push(`(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`);
    queryParams.push(`%${search.trim()}%`);
    paramIndex++;
  }

  // Category filter
  if (category && category !== 'all') {
    whereConditions.push(`c.name = $${paramIndex}`);
    queryParams.push(category);
    paramIndex++;
  }

  // Status filter (based on stock levels)
  if (status && status !== 'all') {
    switch (status) {
      case 'out_of_stock':
        whereConditions.push('p.stock = 0');
        break;
      case 'low_stock':
        whereConditions.push('p.stock > 0 AND p.stock < 10');
        break;
      case 'active':
        whereConditions.push('p.stock >= 10');
        break;
    }
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  // Build ORDER BY clause
  const validSortFields = ['name', 'price', 'stock', 'created_at'];
  const sortField = validSortFields.includes(sortBy as string) ? sortBy : 'created_at';
  const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';
  const orderClause = `ORDER BY p.${sortField} ${sortDirection}`;

  // Calculate pagination
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit))); // Max 100 items per page
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
      p.category_id,
      p.created_at,
      p.updated_at,
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

  try {
    // Execute both queries
    const [productsResult, countResult] = await Promise.all([
      query(productsQuery, queryParams),
      query(countQuery, countParams)
    ]);

    const products: ProductWithCategory[] = productsResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      image_url: row.image_url,
      stock: parseInt(row.stock),
      category_id: row.category_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      category_name: row.category_name
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
      message: 'Failed to fetch products'
    });
  }
}));

// @route   GET /api/admin/categories
// @desc    Get all categories
// @access  Private (Admin only)
router.get('/categories', asyncHandler(async (req: Request, res: Response<AdminCategoriesResponse>) => {
  try {
    const result = await query(
      'SELECT id, name, created_at FROM categories ORDER BY name ASC'
    );

    const categories: Category[] = result.rows.map(row => ({
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
      message: 'Failed to fetch categories'
    });
  }
}));

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/stats', asyncHandler(async (req: Request, res: Response<AdminStatsResponse>) => {
  try {
    // Execute multiple queries to get dashboard statistics
    const [
      productsStatsResult,
      categoriesCountResult,
      usersCountResult,
      ordersCountResult
    ] = await Promise.all([
      // Products statistics
      query(`
        SELECT 
          COUNT(*) as total_products,
          COALESCE(SUM(price * stock), 0) as total_value,
          COUNT(CASE WHEN stock > 0 AND stock < 10 THEN 1 END) as low_stock_products,
          COUNT(CASE WHEN stock = 0 THEN 1 END) as out_of_stock_products
        FROM products
      `),
      // Categories count
      query('SELECT COUNT(*) as total FROM categories'),
      // Users count
      query('SELECT COUNT(*) as total FROM users'),
      // Orders count
      query('SELECT COUNT(*) as total FROM orders')
    ]);

    const productStats = productsStatsResult.rows[0];
    const stats: AdminStats = {
      totalProducts: parseInt(productStats.total_products),
      totalValue: parseFloat(productStats.total_value),
      lowStockProducts: parseInt(productStats.low_stock_products),
      outOfStockProducts: parseInt(productStats.out_of_stock_products),
      totalCategories: parseInt(categoriesCountResult.rows[0].total),
      totalUsers: parseInt(usersCountResult.rows[0].total),
      totalOrders: parseInt(ordersCountResult.rows[0].total)
    };

    res.json({
      success: true,
      message: 'Statistics retrieved successfully',
      data: stats
    });

  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
}));

// @route   DELETE /api/admin/products/:id
// @desc    Delete a product by ID
// @access  Private (Admin only)
router.delete('/products/:id', asyncHandler(async (req: Request, res: Response<AdminDeleteProductResponse>) => {
  try {
    const productId = req.params.id;

    // Validate product ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(productId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
      return;
    }

    // First, check if the product exists and get its details
    const existingProductResult = await query(
      'SELECT id, name FROM products WHERE id = $1',
      [productId]
    );

    if (existingProductResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }

    const productToDelete = existingProductResult.rows[0];

    // Delete the product
    const deleteResult = await query(
      'DELETE FROM products WHERE id = $1 RETURNING id',
      [productId]
    );

    if (deleteResult.rows.length === 0) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete product'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: {
        deletedProductId: productToDelete.id,
        deletedProductName: productToDelete.name
      }
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting product'
    });
  }
}));

export default router;
