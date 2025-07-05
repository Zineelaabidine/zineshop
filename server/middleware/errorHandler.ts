import { Request, Response, NextFunction } from 'express';

// Custom error interface
interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  constraint?: string;
}

// Error response interface
interface ErrorResponse {
  success: boolean;
  message: string;
  stack?: string;
}

// Global error handling middleware
const errorHandler = (
  err: CustomError, 
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  console.error('Error:', err);

  // Default error
  let error: ErrorResponse = {
    success: false,
    message: err.message || 'Internal Server Error'
  };

  let statusCode = err.statusCode || 500;

  // PostgreSQL errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        if (err.constraint === 'users_email_key') {
          error.message = 'An account with this email already exists';
          statusCode = 409;
        } else {
          error.message = 'Duplicate entry detected';
          statusCode = 409;
        }
        break;
      
      case '23503': // Foreign key violation
        error.message = 'Referenced record does not exist';
        statusCode = 400;
        break;
      
      case '23502': // Not null violation
        error.message = 'Required field is missing';
        statusCode = 400;
        break;
      
      case '22001': // String data too long
        error.message = 'Input data is too long';
        statusCode = 400;
        break;
      
      case '08006': // Connection failure
        error.message = 'Database connection failed';
        statusCode = 503;
        break;
      
      default:
        error.message = 'Database error occurred';
        statusCode = 500;
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    statusCode = 401;
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error.message = 'Validation failed';
    statusCode = 400;
  }

  // Cast errors (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    error.message = 'Invalid ID format';
    statusCode = 400;
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    error.message = 'Internal Server Error';
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    error.stack = err.stack;
  }

  res.status(statusCode).json(error);
};

// 404 handler
const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error: CustomError = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
};

// Async error wrapper
const asyncHandler = (fn: Function) => (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

export {
  errorHandler,
  notFound,
  asyncHandler,
  CustomError,
  ErrorResponse
};
