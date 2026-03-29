import { authService } from '../services/auth.service.js';
import { logger } from '../utils/logger.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

const JWT_SECRET = config.JWT_SECRET || 'your_jwt_secret_key_demo';

/**
 * Admin/Staff Authentication Controller
 */

export const authController = {
  adminLogin: async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          error: 'Username and password are required'
        });
      }

      const result = await authService.loginAdmin(username, password);

      if (!result.success) {
        return res.status(result.statusCode || 401).json({
          error: result.error
        });
      }

      // Set token in httpOnly cookie
      res.cookie('admin_token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      res.json({
        success: true,
        token: result.token,
        admin: result.admin
      });
    } catch (error) {
      logger.error('Admin login controller error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  },

  staffLogin: async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          error: 'Username and password are required'
        });
      }

      const result = await authService.loginStaff(username, password);

      if (!result.success) {
        return res.status(result.statusCode || 401).json({
          error: result.error
        });
      }

      // Set token in httpOnly cookie
      res.cookie('staff_token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      res.json({
        success: true,
        token: result.token,
        staff: result.staff
      });
    } catch (error) {
      logger.error('Staff login controller error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  },

  logout: async (req, res) => {
    try {
      res.clearCookie('admin_token');
      res.clearCookie('staff_token');
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  },

  verifyToken: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1] || req.cookies.admin_token || req.cookies.staff_token;

      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = authService.verifyToken(token);

      if (!decoded) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      res.json({
        success: true,
        user: decoded
      });
    } catch (error) {
      logger.error('Token verification error:', error);
      res.status(500).json({ error: 'Verification failed' });
    }
  },

  refreshToken: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1] || req.cookies.admin_token || req.cookies.staff_token;

      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = authService.verifyToken(token);

      if (!decoded) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      // Generate new token
      const newToken = jwt.sign(decoded, JWT_SECRET, { expiresIn: '24h' });

      res.cookie(decoded.type === 'department_admin' ? 'admin_token' : 'staff_token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
      });

      res.json({
        success: true,
        token: newToken
      });
    } catch (error) {
      logger.error('Token refresh error:', error);
      res.status(500).json({ error: 'Refresh failed' });
    }
  }
};
