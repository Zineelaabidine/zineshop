import bcrypt from 'bcryptjs';
import { query } from '../config/database';

// Admin user configuration from environment variables
const ADMIN_CONFIG = {
  email: process.env.ADMIN_EMAIL || 'admin@zineshop.com',
  password: process.env.ADMIN_PASSWORD || 'AdminTest123!',
  fullName: process.env.ADMIN_FULL_NAME || 'Admin User',
  isAdmin: true
};

// Password validation function (matches auth.ts validation)
const validatePassword = (password: string): boolean => {
  // Check length (6-128 characters)
  if (password.length < 6 || password.length > 128) {
    return false;
  }
  
  // Check for at least one lowercase letter, one uppercase letter, and one number
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  return hasLowercase && hasUppercase && hasNumber;
};

// Email validation function (matches auth.ts validation)
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

// Full name validation function (matches auth.ts validation)
const validateFullName = (fullName: string): boolean => {
  const nameRegex = /^[a-zA-Z\s]+$/;
  return fullName.length >= 2 && fullName.length <= 100 && nameRegex.test(fullName);
};

/**
 * Initialize admin user if it doesn't exist
 * This function is idempotent and safe to run multiple times
 */
export const initializeAdminUser = async (): Promise<void> => {
  try {


    // Validate admin configuration
    if (!validateEmail(ADMIN_CONFIG.email)) {
      throw new Error('Invalid admin email configuration');
    }
    
    if (!validatePassword(ADMIN_CONFIG.password)) {
      throw new Error('Invalid admin password configuration');
    }
    
    if (!validateFullName(ADMIN_CONFIG.fullName)) {
      throw new Error('Invalid admin full name configuration');
    }

    // Check if admin user already exists
    const existingUserResult = await query(
      'SELECT id, email, is_admin FROM users WHERE email = $1',
      [ADMIN_CONFIG.email]
    );

    if (existingUserResult.rows.length > 0) {
      const existingUser = existingUserResult.rows[0];
      
      if (!existingUser.is_admin) {
        console.log('⚠️  User with admin email exists but is not an admin');
        console.log('   Manual intervention required to grant admin privileges');
      }
      return;
    }

    // Hash password using same salt rounds as auth.ts
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(ADMIN_CONFIG.password, saltRounds);

    // Create admin user
    const createUserResult = await query(
      `INSERT INTO users (full_name, email, password_hash, is_admin, created_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING id, full_name, email, is_admin, created_at`,
      [
        ADMIN_CONFIG.fullName,
        ADMIN_CONFIG.email,
        passwordHash,
        ADMIN_CONFIG.isAdmin
      ]
    );

    if (createUserResult.rows.length > 0) {
      console.log('✅ Admin user created successfully');
      console.log(`   Email: ${ADMIN_CONFIG.email}`);
      console.log(`   Password: ${ADMIN_CONFIG.password}`);
    } else {
      throw new Error('Failed to create admin user - no rows returned');
    }

  } catch (error) {
    console.error('❌ Error initializing admin user:', (error as Error).message);
    
    // Don't throw the error to prevent server startup failure
    // Log the error and continue with server startup
    if (process.env.NODE_ENV === 'development') {
      console.error('   Stack trace:', (error as Error).stack);
    }
    
    console.log('⚠️  Server will continue starting without admin user initialization');
    console.log('   You can create an admin user manually using the Supabase dashboard');
  }
};

/**
 * Check if admin user exists and has proper privileges
 * Useful for health checks
 */
export const checkAdminUser = async (): Promise<boolean> => {
  try {
    const result = await query(
      'SELECT id, email, is_admin FROM users WHERE email = $1 AND is_admin = true',
      [ADMIN_CONFIG.email]
    );
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('❌ Error checking admin user:', (error as Error).message);
    return false;
  }
};

export default {
  initializeAdminUser,
  checkAdminUser,
  ADMIN_CONFIG: {
    email: ADMIN_CONFIG.email,
    fullName: ADMIN_CONFIG.fullName
  }
};
