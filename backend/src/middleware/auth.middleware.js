import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

/**
 * Verify JWT token middleware
 */
export const verifyToken = (req, res, next) => {
  try {
    // Get token from header or cookie
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.admin_token || req.cookies?.staff_token;

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Token verification error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Extract user info from token (non-blocking)
 */
export const extractUser = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.admin_token || req.cookies?.staff_token;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.user = decoded;
    }
    next();
  } catch (error) {
    logger.error('Extract user error:', error);
    next();
  }
};

/**
 * Legacy middleware for backward compatibility
 */
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Authentication error:', error.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};

/**
 * Legacy authorization middleware for backward compatibility
 */
export const authorize = (requiredRole) => {
  return (req, res, next) => {
    if (req.user.role !== requiredRole) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};
