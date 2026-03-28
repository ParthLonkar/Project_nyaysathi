import { userService } from '../services/user.service.js';
import { logger } from '../utils/logger.js';

export const userController = {
  /**
   * GET /user/profile
   * Get logged-in user profile
   */
  getProfile: async (req, res) => {
    try {
      const { id: userId, type: userType } = req.user;

      if (!userId || !userType) {
        return res.status(400).json({ error: 'User information missing' });
      }

      const result = await userService.getUserProfile(userId, userType === 'department_admin' ? 'admin' : 'staff');

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json({ success: true, user: result.user });
    } catch (error) {
      logger.error('Get profile error:', error);
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }
  },

  /**
   * PUT /user/profile
   * Update user profile
   */
  updateProfile: async (req, res) => {
    try {
      const { id: userId, type: userType } = req.user;
      const updateData = req.body;

      if (!userId || !userType) {
        return res.status(400).json({ error: 'User information missing' });
      }

      const userTypeStr = userType === 'department_admin' ? 'admin' : 'staff';
      const result = await userService.updateUserProfile(userId, userTypeStr, updateData);

      if (!result.success) {
        return res.status(400).json(result);
      }

      // Log the activity
      userService.addActivityLog(userId, userTypeStr, 'profile_updated', updateData);

      return res.status(200).json({ success: true, user: result.user });
    } catch (error) {
      logger.error('Update profile error:', error);
      return res.status(500).json({ error: 'Failed to update profile' });
    }
  },

  /**
   * POST /user/change-password
   * Change user password
   */
  changePassword: async (req, res) => {
    try {
      const { id: userId, type: userType } = req.user;
      const { oldPassword, newPassword, confirmPassword } = req.body;

      if (!userId || !userType) {
        return res.status(400).json({ error: 'User information missing' });
      }

      // Validate inputs
      if (!oldPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ error: 'Please provide old password, new password, and confirmation' });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'New passwords do not match' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
      }

      if (oldPassword === newPassword) {
        return res.status(400).json({ error: 'New password must be different from old password' });
      }

      const userTypeStr = userType === 'department_admin' ? 'admin' : 'staff';
      const result = await userService.changePassword(userId, userTypeStr, oldPassword, newPassword);

      if (!result.success) {
        return res.status(400).json(result);
      }

      // Log the activity
      userService.addActivityLog(userId, userTypeStr, 'password_changed');

      return res.status(200).json(result);
    } catch (error) {
      logger.error('Change password error:', error);
      return res.status(500).json({ error: 'Failed to change password' });
    }
  },

  /**
   * GET /user/performance
   * Get user performance stats
   */
  getPerformanceStats: async (req, res) => {
    try {
      const { id: userId, type: userType } = req.user;

      if (!userId || !userType) {
        return res.status(400).json({ error: 'User information missing' });
      }

      const userTypeStr = userType === 'department_admin' ? 'admin' : 'staff';
      const result = await userService.getPerformanceStats(userId, userTypeStr);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json({ success: true, stats: result.stats });
    } catch (error) {
      logger.error('Get performance stats error:', error);
      return res.status(500).json({ error: 'Failed to fetch performance stats' });
    }
  },

  /**
   * GET /user/activity-log
   * Get user activity log
   */
  getActivityLog: async (req, res) => {
    try {
      const { id: userId, type: userType } = req.user;
      const { limit = 50 } = req.query;

      if (!userId || !userType) {
        return res.status(400).json({ error: 'User information missing' });
      }

      const userTypeStr = userType === 'department_admin' ? 'admin' : 'staff';
      const result = await userService.getActivityLog(userId, userTypeStr, parseInt(limit));

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json({ success: true, logs: result.logs });
    } catch (error) {
      logger.error('Get activity log error:', error);
      return res.status(500).json({ error: 'Failed to fetch activity log' });
    }
  },

  /**
   * GET /admin/department-analytics
   * Get department analytics (admin only)
   */
  getDepartmentAnalytics: async (req, res) => {
    try {
      const { department_id } = req.user;

      if (!department_id) {
        return res.status(400).json({ error: 'Department information missing' });
      }

      const result = await userService.getDepartmentAnalytics(department_id);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json({ success: true, analytics: result.analytics });
    } catch (error) {
      logger.error('Get department analytics error:', error);
      return res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  }
};
