import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';
import { authService } from './auth.service.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

/**
 * Department Admin Service
 * Manages staff, complaints, and analytics for a department
 */

export const adminService = {
  /**
   * Get all complaints for admin's department
   */
  getDepartmentComplaints: async (departmentId, filters = {}) => {
    try {
      let query = supabase
        .from('complaints')
        .select(`
          id,
          title,
          description,
          category,
          status,
          priority,
          submitted_at,
          progress_percentage,
          sla_breached,
          sla_days,
          assigned_staff_id,
          department_staff (
            id,
            staff_name,
            position
          )
        `)
        .eq('department_id', departmentId);

      // Apply filters
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.priority) query = query.eq('priority', filters.priority);

      const { data, error } = await query.order('submitted_at', { ascending: false });

      if (error) {
        logger.error('Get complaints error:', error);
        return { success: false, error: 'Failed to fetch complaints' };
      }

      return { success: true, complaints: data };
    } catch (error) {
      logger.error('Get complaints error:', error);
      return { success: false, error: 'Failed to fetch complaints' };
    }
  },

  /**
   * Get all staff in admin's department
   */
  getDepartmentStaff: async (departmentId) => {
    try {
      const { data: staff, error } = await supabase
        .from('department_staff')
        .select(`
          id,
          staff_name,
          email,
          phone,
          position,
          is_active,
          complaints_assigned,
          complaints_resolved,
          average_resolution_days,
          staff_performance (
            customer_satisfaction_score,
            sla_achievement_rate,
            on_time_completion_rate
          )
        `)
        .eq('department_id', departmentId)
        .order('staff_name', { ascending: true });

      if (error) {
        logger.error('Get staff error:', error);
        return { success: false, error: 'Failed to fetch staff' };
      }

      return { success: true, staff };
    } catch (error) {
      logger.error('Get staff error:', error);
      return { success: false, error: 'Failed to fetch staff' };
    }
  },

  /**
   * Assign complaint to staff member
   */
  assignComplaintToStaff: async (complaintId, staffId, adminId, departmentId, notes = '') => {
    try {
      // Create staff assignment
      const { data: assignment, error: assignError } = await supabase
        .from('staff_assignments')
        .insert({
          complaint_id: complaintId,
          staff_id: staffId,
          admin_id: adminId,
          department_id: departmentId,
          assignment_notes: notes,
          status: 'active'
        })
        .select()
        .single();

      if (assignError) {
        logger.error('Assign complaint error:', assignError);
        return { success: false, error: 'Failed to assign complaint' };
      }

      // Update complaint with assigned staff
      const { error: updateError } = await supabase
        .from('complaints')
        .update({
          assigned_staff_id: staffId,
          status: 'assigned'
        })
        .eq('id', complaintId);

      if (updateError) {
        logger.error('Update complaint error:', updateError);
        return { success: false, error: 'Failed to update complaint' };
      }

      // Increment staff assignment count
      const { data: staffData } = await supabase
        .from('department_staff')
        .select('complaints_assigned')
        .eq('id', staffId)
        .single();

      if (staffData) {
        await supabase
          .from('department_staff')
          .update({ complaints_assigned: staffData.complaints_assigned + 1 })
          .eq('id', staffId);
      }

      logger.info(`Complaint ${complaintId} assigned to staff ${staffId}`);

      return { success: true, assignment };
    } catch (error) {
      logger.error('Assign complaint error:', error);
      return { success: false, error: 'Failed to assign complaint' };
    }
  },

  /**
   * Create new staff member
   */
  createStaff: async (staffData, departmentId, adminId) => {
    try {
      const result = await authService.createStaff({
        ...staffData,
        department_id: departmentId,
        admin_id: adminId
      });

      if (!result.success) {
        return result;
      }

      logger.info(`Staff ${staffData.username} created by admin`);
      return result;
    } catch (error) {
      logger.error('Create staff error:', error);
      return { success: false, error: 'Failed to create staff' };
    }
  },

  /**
   * Deactivate staff member
   */
  deactivateStaff: async (staffId) => {
    try {
      const { error } = await supabase
        .from('department_staff')
        .update({ is_active: false })
        .eq('id', staffId);

      if (error) {
        logger.error('Deactivate staff error:', error);
        return { success: false, error: 'Failed to deactivate staff' };
      }

      logger.info(`Staff ${staffId} deactivated`);
      return { success: true };
    } catch (error) {
      logger.error('Deactivate staff error:', error);
      return { success: false, error: 'Failed to deactivate staff' };
    }
  },

  /**
   * Get department analytics
   */
  getDepartmentAnalytics: async (departmentId) => {
    try {
      const { data: analytics, error } = await supabase
        .from('department_analytics')
        .select('*')
        .eq('department_id', departmentId)
        .single();

      if (error && !error.message.includes('No rows')) {
        logger.error('Get analytics error:', error);
        return { success: false, error: 'Failed to fetch analytics' };
      }

      return {
        success: true,
        analytics: analytics || {
          total_complaints: 0,
          complaints_pending: 0,
          complaints_in_progress: 0,
          complaints_resolved: 0,
          average_resolution_days: 0,
          sla_compliance_rate: 0
        }
      };
    } catch (error) {
      logger.error('Get analytics error:', error);
      return { success: false, error: 'Failed to fetch analytics' };
    }
  },

  /**
   * Get dashboard summary
   */
  getDashboardSummary: async (departmentId) => {
    try {
      // Get complaints count
      const { data: complaints, error: complaintsError } = await supabase
        .from('complaints')
        .select('status')
        .eq('department_id', departmentId);

      if (complaintsError) {
        return { success: false, error: 'Failed to fetch data' };
      }

      // Get staff count
      const { data: staff, error: staffError } = await supabase
        .from('department_staff')
        .select('id, is_active')
        .eq('department_id', departmentId);

      if (staffError) {
        return { success: false, error: 'Failed to fetch data' };
      }

      // Calculate stats
      const stats = {
        total_complaints: complaints.length,
        pending: complaints.filter(c => ['routed', 'received', 'assigned'].includes(c.status)).length,
        in_progress: complaints.filter(c => c.status === 'in_progress').length,
        resolved: complaints.filter(c => c.status === 'resolved').length,
        total_staff: staff.length,
        active_staff: staff.filter(s => s.is_active).length
      };

      return { success: true, stats };
    } catch (error) {
      logger.error('Get summary error:', error);
      return { success: false, error: 'Failed to fetch summary' };
    }
  },

  /**
   * Get staff performance details
   */
  getStaffPerformance: async (staffId) => {
    try {
      const { data: performance, error } = await supabase
        .from('staff_performance')
        .select('*')
        .eq('staff_id', staffId)
        .single();

      if (error) {
        return { success: false, error: 'Failed to fetch performance' };
      }

      return { success: true, performance };
    } catch (error) {
      logger.error('Get performance error:', error);
      return { success: false, error: 'Failed to fetch performance' };
    }
  }
};
