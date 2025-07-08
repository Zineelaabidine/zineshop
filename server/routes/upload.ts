import express, { Request, Response } from 'express';
import multer from 'multer';
import { supabase, PRODUCT_IMAGES_BUCKET, getPublicImageUrl, generateUniqueFileName, isSupabaseConfigured } from '../config/supabase';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
    }
  }
});

// Image upload response interface
interface ImageUploadResponse {
  success: boolean;
  message: string;
  data?: {
    imageUrl: string;
    fileName: string;
  };
}

// @route   POST /api/upload/product-image
// @desc    Upload product image to Supabase Storage
// @access  Private (Admin only)
router.post('/product-image',
  authenticateToken,
  requireAdmin,
  upload.single('image'),
  asyncHandler(async (req: Request, res: Response<ImageUploadResponse>) => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
        return;
      }

      // Check if Supabase Storage is configured
      if (!isSupabaseConfigured || !supabase) {
        // Fallback: Return a data URL for the image
        const base64Image = req.file.buffer.toString('base64');
        const dataUrl = `data:${req.file.mimetype};base64,${base64Image}`;

        res.json({
          success: true,
          message: 'Image processed successfully (using fallback storage)',
          data: {
            imageUrl: dataUrl,
            fileName: req.file.originalname
          }
        });
        return;
      }

      // Generate unique filename
      const fileName = generateUniqueFileName(req.file.originalname);

      // Upload to Supabase Storage
      const { data, error } = await supabase!.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Supabase Storage upload error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to upload image to storage'
        });
        return;
      }

      // Get public URL for the uploaded image
      const imageUrl = getPublicImageUrl(fileName);

      res.json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          imageUrl,
          fileName
        }
      });

    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during image upload'
      });
    }
  })
);

// @route   DELETE /api/upload/product-image/:fileName
// @desc    Delete product image from Supabase Storage
// @access  Private (Admin only)
router.delete('/product-image/:fileName',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req: Request, res: Response<ImageUploadResponse>) => {
    try {
      const { fileName } = req.params;

      if (!fileName) {
        res.status(400).json({
          success: false,
          message: 'No filename provided'
        });
        return;
      }

      // Check if Supabase Storage is configured
      if (!isSupabaseConfigured || !supabase) {
        // For fallback storage (data URLs), no actual deletion needed
        res.json({
          success: true,
          message: 'Image reference removed successfully (fallback storage)'
        });
        return;
      }

      // Delete from Supabase Storage
      const { error } = await supabase!.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .remove([fileName]);

      if (error) {
        console.error('Supabase Storage delete error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to delete image from storage'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Image deleted successfully'
      });

    } catch (error) {
      console.error('Image delete error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during image deletion'
      });
    }
  })
);

export default router;
