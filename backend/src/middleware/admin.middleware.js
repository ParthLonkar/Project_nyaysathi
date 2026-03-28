import { logger } from '../utils/logger.js';

/**
 * Verify admin role middleware
 */
export const verifyAdminRole = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (req.user.role !== 'department_admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    logger.error('Admin role verification error:', error);
    return res.status(500).json({ error: 'Failed to verify admin role' });
  }
};
