import express, { Request, Response } from 'express';
import { query } from '../config/database';

const router = express.Router();

/**
 * GET /api/delivery-methods
 * Get all active delivery methods
 */
router.get('/delivery-methods', async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT id, name, description, price, estimated_days FROM delivery_methods WHERE is_active = true ORDER BY price ASC'
    );

    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        price: parseFloat(row.price),
        estimatedDays: row.estimated_days
      }))
    });
  } catch (error) {
    console.error('Error fetching delivery methods:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery methods'
    });
  }
});

export default router;
