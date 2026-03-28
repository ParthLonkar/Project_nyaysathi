import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';
import { authService } from './auth.service.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export const userService = {
  /**
   * Get user profile (Admin or Staff)
   */
  getUserProfile: async (userId, userType) => {
    try {
      const table = userType === 'admin' ? 'department_admins' : 'department_staff';
      
      // Build select string based on user type
      let selectStr;
      
      if (userType === 'admin') {
        selectStr = 'id, admin_name, email, phone, department_id, username, created_at, updated_at';
      } else {
        selectStr = 'id, staff_name, email, phone, department_id, position, expertise_area, is_active, created_at, updated_at';
      }

      const { data: userData, error: userError } = await supabase
        .from(table)
        .select(selectStr)
        .eq('id', userId)
        .single();

      if (userError) {
        logger.error(`Get ${userType} profile error:`, userError.message);
        return { success: false, error: `Failed to fetch ${userType} profile` };
      }

      if (!userData) {
        logger.warn(`No profile found for ${userType} user: ${userId}`);
        return { success: false, error: 'Profile not found' };
      }

      // Fetch department data separately
      if (userData.department_id) {
        const { data: deptData } = await supabase
          .from('departments')
          .select('id, name, code')
          .eq('id', userData.department_id)
          .single();

        if (deptData) {
          userData.department_name = deptData.name;
          userData.department_code = deptData.code;
        }
      }

      return { success: true, user: userData };
    } catch (error) {
      logger.error('Get user profile error:', error.message);
      return { success: false, error: 'Failed to fetch profile' };
    }
  },

  /**
   * Update user profile
   */
  updateUserProfile: async (userId, userType, updateData) => {
    try {
      const table = userType === 'admin' ? 'department_admins' : 'department_staff';
      
      // Sanitize updateData - only allow certain fields
      const allowedFields = userType === 'admin' 
        ? ['admin_name', 'email', 'phone', 'username']
        : ['staff_name', 'email', 'phone', 'position', 'expertise_area'];
      
      const sanitized = {};
      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          sanitized[key] = updateData[key];
        }
      });

      sanitized.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from(table)
        .update(sanitized)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        logger.error(`Update ${userType} profile error:`, error);
        return { success: false, error: 'Failed to update profile' };
      }

      logger.info(`${userType} profile updated: ${userId}`);
      return { success: true, user: data };
    } catch (error) {
      logger.error('Update user profile error:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  },

  /**
   * Change password
   */
  changePassword: async (userId, userType, oldPassword, newPassword) => {
    try {
      const table = userType === 'admin' ? 'department_admins' : 'department_staff';
      
      // Get current user
      const { data: user, error: fetchError } = await supabase
        .from(table)
        .select('password_hash')
        .eq('id', userId)
        .single();

      if (fetchError || !user) {
        return { success: false, error: 'User not found' };
      }

      // Verify old password
      const isValid = await authService.verifyPassword(oldPassword, user.password_hash);
      if (!isValid) {
        return { success: false, error: 'Current password is incorrect' };
      }

      // Hash new password
      const newHash = await authService.hashPassword(newPassword);

      // Update password
      const { error: updateError } = await supabase
        .from(table)
        .update({ password_hash: newHash, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (updateError) {
        logger.error('Change password error:', updateError);
        return { success: false, error: 'Failed to change password' };
      }

      logger.info(`Password changed for ${userType}: ${userId}`);
      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      logger.error('Change password error:', error);
      return { success: false, error: 'Failed to change password' };
    }
  },

  /**
   * Get user performance stats
   */
  getPerformanceStats: async (userId, userType) => {
    try {
      if (userType === 'admin') {
        // Admin dashboard stats
        const { data: complaints, error: complaintError } = await supabase
          .from('complaints')
          .select('status')
          .eq('assigned_admin_id', userId);

        if (complaintError) throw complaintError;

        const stats = {
          total: complaints?.length || 0,
          resolved: complaints?.filter(c => c.status === 'resolved').length || 0,
          pending: complaints?.filter(c => c.status === 'pending').length || 0,
          escalated: complaints?.filter(c => c.status === 'escalated').length || 0,
          resolutionRate: complaints?.length ? Math.round((complaints.filter(c => c.status === 'resolved').length / complaints.length) * 100) : 0
        };

        return { success: true, stats };
      } else {
        // Staff performance stats
        const { data: performance, error } = await supabase
          .from('staff_performance')
          .select('*')
          .eq('staff_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        const { data: assignments, error: assignError } = await supabase
          .from('staff_assignments')
          .select('status')
          .eq('staff_id', userId);

        if (assignError) throw assignError;

        const stats = {
          assigned: assignments?.length || 0,
          resolved: assignments?.filter(a => a.status === 'resolved').length || 0,
          pending: assignments?.filter(a => a.status === 'pending').length || 0,
          performance_score: performance?.performance_score || 0,
          total_resolved: performance?.total_resolved || 0,
          average_resolution_time: performance?.average_resolution_time || 0
        };

        return { success: true, stats };
      }
    } catch (error) {
      logger.error('Get performance stats error:', error);
      return { success: false, error: 'Failed to fetch performance stats' };
    }
  },

  /**
   * Get user activity log
   */
  getActivityLog: async (userId, userType, limit = 50) => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('user_type', userType)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error && error.code !== 'PGRST116') throw error;

      return { success: true, logs: data || [] };
    } catch (error) {
      logger.error('Get activity log error:', error);
      return { success: false, error: 'Failed to fetch activity log', logs: [] };
    }
  },

  /**
   * Add activity log entry
   */
  addActivityLog: async (userId, userType, action, details = {}) => {
    try {
      const { error } = await supabase
        .from('activity_logs')
        .insert({
          user_id: userId,
          user_type: userType,
          action,
          details,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      logger.warn('Add activity log error:', error);
      // Don't fail the main operation if logging fails
      return { success: false };
    }
  },

  /**
   * Get department analytics (for admins only)
   */
  getDepartmentAnalytics: async (departmentId) => {
    try {
      // Total complaints
      const { data: complaints, error: complaintError } = await supabase
        .from('complaints')
        .select('status, priority, created_at')
        .eq('department_id', departmentId);

      if (complaintError) throw complaintError;

      // Staff count
      const { data: staff, error: staffError } = await supabase
        .from('department_staff')
        .select('id, is_active')
        .eq('department_id', departmentId);

      if (staffError) throw staffError;

      // Calculate metrics
      const analytics = {
        total_complaints: complaints?.length || 0,
        resolved_complaints: complaints?.filter(c => c.status === 'resolved').length || 0,
        pending_complaints: complaints?.filter(c => c.status === 'pending').length || 0,
        escalated_complaints: complaints?.filter(c => c.status === 'escalated').length || 0,
        total_staff: staff?.length || 0,
        active_staff: staff?.filter(s => s.is_active).length || 0,
        resolution_rate: complaints?.length ? Math.round((complaints.filter(c => c.status === 'resolved').length / complaints.length) * 100) : 0,
        high_priority: complaints?.filter(c => c.priority === 'high').length || 0,
        medium_priority: complaints?.filter(c => c.priority === 'medium').length || 0
      };

      return { success: true, analytics };
    } catch (error) {
      logger.error('Get department analytics error:', error);
      return { success: false, error: 'Failed to fetch analytics' };
    }
  }
};
