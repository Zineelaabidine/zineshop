import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { Server } from 'http';

// Load environment variables
dotenv.config();

// Import database connection
import { testConnection, closePool } from './config/database';

// Import admin initialization
import { initializeAdminUser } from './utils/initAdmin';

// Import Supabase Storage setup
import { setupProductImagesBucket } from './utils/setupSupabaseStorageBucket';

// Import middleware
import { errorHandler, notFound } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import uploadRoutes from './routes/upload';
import productsRoutes from './routes/products';

// Create Express app
const app: Application = express();

// Test database connection
testConnection();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: [
        "'self'",
        "data:",
        "https://images.unsplash.com",
        "https://images.pexels.com",
        "https://*.supabase.co",
        "https://hefxcscvefwvowrnobzr.supabase.co"
      ],
      connectSrc: ["'self'", "https://*.supabase.co"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes default
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(limiter);

// CORS configuration - optimized for unified frontend + backend serving
app.use(cors({
  origin: true,
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/products', productsRoutes);

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../client/dist')));

// Handle React Router (return `index.html` for all non-API routes)
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Setup graceful shutdown handlers
const setupGracefulShutdown = (server: Server): void => {
  // Graceful shutdown function
  const gracefulShutdown = (signal: string): void => {
    console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

    server.close(() => {
      console.log('✅ HTTP server closed');

      // Close database connections
      closePool().then(() => {
        console.log('✅ Database connections closed');
        process.exit(0);
      }).catch((error: Error) => {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      });
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error('❌ Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  // Handle shutdown signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    console.error('❌ Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
  });
};

// Initialize server
const startServer = async (): Promise<void> => {
  try {
    // Initialize admin user after database connection is established
    await initializeAdminUser();

    // Set up Supabase Storage bucket for product images
    await setupProductImagesBucket();

    // Start HTTP server
    const PORT: number = parseInt(process.env.PORT || '5000', 10);

    const server: Server = app.listen(PORT, () => {
      console.log(`
🚀 ZineShop API Server Started
📍 Environment: ${process.env.NODE_ENV || 'development'}
🌐 Server running on port ${PORT}
🔗 API URL: http://localhost:${PORT}
📊 Health check: http://localhost:${PORT}/health
🔐 Auth endpoints: http://localhost:${PORT}/api/auth
      `);
    });

    // Set up graceful shutdown handlers
    setupGracefulShutdown(server);

  } catch (error) {
    console.error('❌ Failed to start server:', (error as Error).message);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
