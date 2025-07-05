import { Pool, PoolClient, QueryResult } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration interface
interface DatabaseConfig {
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  ssl?: {
    rejectUnauthorized: boolean;
  };
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
  acquireTimeoutMillis?: number;
  createTimeoutMillis?: number;
  destroyTimeoutMillis?: number;
  reapIntervalMillis?: number;
  createRetryIntervalMillis?: number;
}

// Create a connection pool to the PostgreSQL database
const config: DatabaseConfig = {
  // Try individual parameters first, fallback to connection string
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false // Required for Supabase connections
  },
  // Connection pool settings
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
  acquireTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be acquired
  createTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be created
  destroyTimeoutMillis: 5000, // Return an error after 5 seconds if connection could not be destroyed
  reapIntervalMillis: 1000, // Check for idle connections every second
  createRetryIntervalMillis: 200, // Retry creating connection every 200ms
};

const pool = new Pool(config);

// Test the database connection
const testConnection = async (): Promise<void> => {
  try {
    const client: PoolClient = await pool.connect();
    console.log('✅ Database connected successfully');
    
    // Test query to verify connection
    const result: QueryResult = await client.query('SELECT NOW()');
    console.log('📅 Database time:', result.rows[0].now);
    
    client.release();
  } catch (error) {
    console.error('❌ Database connection error:', (error as Error).message);
    process.exit(1);
  }
};

// Query helper function with proper typing
const query = async (text: string, params?: any[]): Promise<QueryResult> => {
  const start = Date.now();
  try {
    const result: QueryResult = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Executed query:', { 
        text, 
        duration: `${duration}ms`, 
        rows: result.rowCount 
      });
    }
    
    return result;
  } catch (error) {
    console.error('❌ Database query error:', (error as Error).message);
    throw error;
  }
};

// Get a client from the pool for transactions
const getClient = async (): Promise<PoolClient> => {
  try {
    const client: PoolClient = await pool.connect();
    return client;
  } catch (error) {
    console.error('❌ Error getting database client:', (error as Error).message);
    throw error;
  }
};

// Graceful shutdown
const closePool = async (): Promise<void> => {
  try {
    await pool.end();
    console.log('🔒 Database pool closed');
  } catch (error) {
    console.error('❌ Error closing database pool:', (error as Error).message);
  }
};

// Handle process termination
process.on('SIGINT', closePool);
process.on('SIGTERM', closePool);

export {
  pool,
  query,
  getClient,
  testConnection,
  closePool
};
