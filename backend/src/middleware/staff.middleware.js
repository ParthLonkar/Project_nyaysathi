import { logger } from '../utils/logger.js';

/**
 * Verify staff role middleware
 */
export const verifyStaffRole = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const type = req.user.type;
    if (type !== 'department_staff') {
      return res.status(403).json({ error: 'Staff access required' });
    }

    next();
  } catch (error) {
    logger.error('Staff role verification error:', error);
    return res.status(500).json({ error: 'Failed to verify staff role' });
  }
};
