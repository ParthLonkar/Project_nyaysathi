import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

/**
 * Admin/Staff Authentication Service
 * Handles login, token generation, and credential validation
 */

export const authService = {
  /**
   * Login for Department Admin
   * @param {string} username - Admin username
   * @param {string} password - Admin password
   * @returns {Promise<{token, admin, department}>}
   */
  loginAdmin: async (username, password) => {
    try {
      // Find admin by username
      const { data: admin, error: adminError } = await supabase
        .from('department_admins')
        .select(`
          id,
          admin_name,
          email,
          phone,
          username,
          password_hash,
          is_active,
          department_id,
          departments (
            id,
            name,
            code,
            email,
            phone,
            sla_days
          )
        `)
        .eq('username', username)
        .single();

      if (adminError || !admin) {
        logger.error(`Admin query error for ${username}:`, {
          error: adminError?.message || 'No data returned',
          admin: admin ? 'exists' : 'null'
        });
        return {
          success: false,
          error: 'Invalid username or password',
          statusCode: 401
        };
      }

      // Check if admin is active
      if (!admin.is_active) {
        return {
          success: false,
          error: 'Admin account is inactive',
          statusCode: 403
        };
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, admin.password_hash);
      if (!passwordMatch) {
        return {
          success: false,
          error: 'Invalid username or password',
          statusCode: 401
        };
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: admin.id,
          type: 'department_admin',
          department_id: admin.department_id,
          department_code: admin.departments.code,
          username: admin.username
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Update last login
      await supabase
        .from('department_admins')
        .update({ last_login: new Date().toISOString() })
        .eq('id', admin.id);

      logger.info(`Admin login successful: ${username}`);

      return {
        success: true,
        token,
        admin: {
          id: admin.id,
          name: admin.admin_name,
          email: admin.email,
          phone: admin.phone,
          username: admin.username,
          department: admin.departments
        }
      };
    } catch (error) {
      logger.error('Admin login error:', error);
      return {
        success: false,
        error: 'Login failed',
        statusCode: 500
      };
    }
  },

  /**
   * Login for Department Staff
   * @param {string} username - Staff username
   * @param {string} password - Staff password
   * @returns {Promise<{token, staff, department, admin}>}
   */
  loginStaff: async (username, password) => {
    try {
      // Find staff by username
      const { data: staff, error: staffError } = await supabase
        .from('department_staff')
        .select(`
          id,
          staff_name,
          email,
          phone,
          position,
          username,
          password_hash,
          is_active,
          department_id,
          admin_id,
          departments (
            id,
            name,
            code,
            email
          ),
          department_admins (
            id,
            admin_name,
            email
          )
        `)
        .eq('username', username)
        .single();

      if (staffError || !staff) {
        return {
          success: false,
          error: 'Invalid username or password',
          statusCode: 401
        };
      }

      // Check if staff is active
      if (!staff.is_active) {
        return {
          success: false,
          error: 'Staff account is inactive',
          statusCode: 403
        };
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, staff.password_hash);
      if (!passwordMatch) {
        return {
          success: false,
          error: 'Invalid username or password',
          statusCode: 401
        };
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: staff.id,
          type: 'department_staff',
          department_id: staff.department_id,
          admin_id: staff.admin_id,
          department_code: staff.departments.code,
          username: staff.username
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Update last login
      await supabase
        .from('department_staff')
        .update({ last_login: new Date().toISOString() })
        .eq('id', staff.id);

      logger.info(`Staff login successful: ${username}`);

      return {
        success: true,
        token,
        staff: {
          id: staff.id,
          name: staff.staff_name,
          email: staff.email,
          phone: staff.phone,
          position: staff.position,
          username: staff.username,
          department: staff.departments,
          admin: staff.department_admins
        }
      };
    } catch (error) {
      logger.error('Staff login error:', error);
      return {
        success: false,
        error: 'Login failed',
        statusCode: 500
      };
    }
  },

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Object} Decoded token or null
   */
  verifyToken: (token) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      logger.warn('Token verification failed:', error.message);
      return null;
    }
  },

  /**
   * Hash password (for admin/staff creation)
   * @param {string} password - Plain password
   * @returns {Promise<string>} Hashed password
   */
  hashPassword: async (password) => {
    try {
      const salt = await bcrypt.genSalt(10);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      logger.error('Password hash error:', error);
      throw error;
    }
  },

  /**
   * Create new admin account
   * @param {Object} adminData - Admin data
   * @returns {Promise<{success, admin, error}>}
   */
  createAdmin: async (adminData) => {
    try {
      const {
        admin_name,
        email,
        phone,
        username,
        password,
        department_id
      } = adminData;

      // Check if username already exists
      const { data: existing } = await supabase
        .from('department_admins')
        .select('id')
        .eq('username', username)
        .single();

      if (existing) {
        return {
          success: false,
          error: 'Username already exists'
        };
      }

      // Hash password
      const password_hash = await authService.hashPassword(password);

      // Create admin
      const { data: newAdmin, error } = await supabase
        .from('department_admins')
        .insert({
          admin_name,
          email,
          phone,
          username,
          password_hash,
          department_id,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        logger.error('Create admin error:', error);
        return {
          success: false,
          error: 'Failed to create admin'
        };
      }

      logger.info(`New admin created: ${username} for department ${department_id}`);

      return {
        success: true,
        admin: newAdmin
      };
    } catch (error) {
      logger.error('Create admin error:', error);
      return {
        success: false,
        error: 'Failed to create admin'
      };
    }
  },

  /**
   * Create new staff account
   * @param {Object} staffData - Staff data
   * @returns {Promise<{success, staff, error}>}
   */
  createStaff: async (staffData) => {
    try {
      const {
        staff_name,
        email,
        phone,
        position,
        expertise_area,
        username,
        password,
        department_id,
        admin_id
      } = staffData;

      // Check if username already exists
      const { data: existing } = await supabase
        .from('department_staff')
        .select('id')
        .eq('username', username)
        .single();

      if (existing) {
        return {
          success: false,
          error: 'Username already exists'
        };
      }

      // Hash password
      const password_hash = await authService.hashPassword(password);

      // Create staff
      const { data: newStaff, error } = await supabase
        .from('department_staff')
        .insert({
          staff_name,
          email,
          phone,
          position,
          expertise_area,
          username,
          password_hash,
          department_id,
          admin_id,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        logger.error('Create staff error:', error);
        return {
          success: false,
          error: 'Failed to create staff'
        };
      }

      // Create staff performance record
      await supabase
        .from('staff_performance')
        .insert({
          staff_id: newStaff.id
        });

      logger.info(`New staff created: ${username} for department ${department_id}`);

      return {
        success: true,
        staff: newStaff
      };
    } catch (error) {
      logger.error('Create staff error:', error);
      return {
        success: false,
        error: 'Failed to create staff'
      };
    }
  }
};
