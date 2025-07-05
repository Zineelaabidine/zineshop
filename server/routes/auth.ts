import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';
import { 
  validateSignUp, 
  validateSignIn, 
  handleValidationErrors, 
  sanitizeInput 
} from '../middleware/validation';
import { authenticateToken, User } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// Request body interfaces
interface SignUpRequestBody {
  fullName: string;
  email: string;
  password: string;
}

interface SignInRequestBody {
  email: string;
  password: string;
}

interface ProfileUpdateRequestBody {
  fullName?: string;
}

// Response interfaces
interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
}

interface ProfileResponse {
  success: boolean;
  message?: string;
  data?: {
    user: User;
  };
}

interface TokenResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
  };
}

// Generate JWT token
const generateToken = (userId: string): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
  );
};

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', 
  sanitizeInput,
  validateSignUp,
  handleValidationErrors,
  asyncHandler(async (req: Request<{}, AuthResponse, SignUpRequestBody>, res: Response<AuthResponse>) => {
    const { fullName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      res.status(409).json({
        success: false,
        message: 'An account with this email already exists'
      });
      return;
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await query(
      `INSERT INTO users (full_name, email, password_hash, is_admin, created_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING id, full_name, email, is_admin, created_at`,
      [fullName, email, passwordHash, false]
    );

    const user = result.rows[0] as User;

    // Generate JWT token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          is_admin: user.is_admin,
          created_at: user.created_at
        },
        token
      }
    });
  })
);

// @route   POST /api/auth/signin
// @desc    Authenticate user and get token
// @access  Public
router.post('/signin',
  sanitizeInput,
  validateSignIn,
  handleValidationErrors,
  asyncHandler(async (req: Request<{}, AuthResponse, SignInRequestBody>, res: Response<AuthResponse>) => {
    const { email, password } = req.body;

    // Get user from database
    const result = await query(
      'SELECT id, full_name, email, password_hash, is_admin, created_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    const user = result.rows[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Sign in successful',
      data: {
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          is_admin: user.is_admin,
          created_at: user.created_at
        },
        token
      }
    });
  })
);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response<ProfileResponse>) => {
    res.json({
      success: true,
      data: {
        user: req.user as User
      }
    });
  })
);

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response<TokenResponse>) => {
    // Generate new token
    const token = generateToken((req.user as User).id);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token
      }
    });
  })
);

// @route   POST /api/auth/signout
// @desc    Sign out user (client-side token removal)
// @access  Private
router.post('/signout',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    // In a more advanced implementation, you might want to blacklist the token
    // For now, we'll just send a success response and let the client handle token removal
    
    res.json({
      success: true,
      message: 'Signed out successfully'
    });
  })
);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile',
  authenticateToken,
  sanitizeInput,
  asyncHandler(async (req: Request<{}, ProfileResponse, ProfileUpdateRequestBody>, res: Response<ProfileResponse>) => {
    const { fullName } = req.body;
    const userId = (req.user as User).id;

    // Update user profile
    const result = await query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name)
       WHERE id = $2 
       RETURNING id, full_name, email, is_admin, created_at`,
      [fullName, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: result.rows[0] as User
      }
    });
  })
);

export default router;
