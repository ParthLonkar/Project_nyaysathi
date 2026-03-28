import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

/**
 * Department Staff Service
 * Manages staff operations on complaints
 */

export const staffService = {
  /**
   * Get all complaints assigned to staff member
   */
  getAssignedComplaints: async (staffId, departmentId, filters = {}) => {
    try {
      let query = supabase
        .from('staff_assignments')
        .select(`
          id,
          complaint_id,
          status,
          assignment_notes,
          assigned_at,
          updated_at,
          complaints (
            id,
            title,
            description,
            category,
            priority,
            status,
            progress_percentage,
            sla_days,
            submitted_at,
            citizen_name,
            citizen_phone,
            citizen_email
          )
        `)
        .eq('staff_id', staffId)
        .eq('status', 'active');

      if (filters.priority) {
        query = query.eq('complaints.priority', filters.priority);
      }
      if (filters.status) {
        query = query.eq('complaints.status', filters.status);
      }

      const { data, error } = await query.order('updated_at', { ascending: false });

      if (error) {
        logger.error('Get assigned complaints error:', error);
        return { success: false, error: 'Failed to fetch complaints' };
      }

      return { success: true, complaints: data };
    } catch (error) {
      logger.error('Get assigned complaints error:', error);
      return { success: false, error: 'Failed to fetch complaints' };
    }
  },

  /**
   * Get details of a specific complaint assigned to staff
   */
  getComplaintDetails: async (complaintId, staffId) => {
    try {
      const { data: complaint, error: complaintError } = await supabase
        .from('complaints')
        .select(`
          *,
          complaint_notes (
            id,
            note_text,
            created_by_name,
            created_at
          ),
          field_visits (
            id,
            visit_date,
            visit_time,
            location,
            visit_type,
            findings,
            status,
            created_at
          )
        `)
        .eq('id', complaintId)
        .single();

      if (complaintError) {
        return { success: false, error: 'Failed to fetch complaint' };
      }

      // Verify staff is assigned to this complaint
      const { data: assignment } = await supabase
        .from('staff_assignments')
        .select('id')
        .eq('complaint_id', complaintId)
        .eq('staff_id', staffId)
        .single();

      if (!assignment) {
        return { success: false, error: 'You are not assigned to this complaint' };
      }

      return { success: true, complaint };
    } catch (error) {
      logger.error('Get complaint details error:', error);
      return { success: false, error: 'Failed to fetch complaint' };
    }
  },

  /**
   * Update complaint status
   */
  updateComplaintStatus: async (complaintId, newStatus, staffId) => {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', complaintId)
        .select()
        .single();

      if (error) {
        logger.error('Update status error:', error);
        return { success: false, error: 'Failed to update status' };
      }

      logger.info(`Complaint ${complaintId} status updated to ${newStatus} by staff ${staffId}`);
      return { success: true, complaint: data };
    } catch (error) {
      logger.error('Update status error:', error);
      return { success: false, error: 'Failed to update status' };
    }
  },

  /**
   * Update complaint progress
   */
  updateComplaintProgress: async (complaintId, progressPercentage) => {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .update({
          progress_percentage: progressPercentage,
          updated_at: new Date().toISOString()
        })
        .eq('id', complaintId)
        .select()
        .single();

      if (error) {
        logger.error('Update progress error:', error);
        return { success: false, error: 'Failed to update progress' };
      }

      return { success: true, complaint: data };
    } catch (error) {
      logger.error('Update progress error:', error);
      return { success: false, error: 'Failed to update progress' };
    }
  },

  /**
   * Add note to complaint
   */
  addComplaintNote: async (complaintId, noteText, staffName) => {
    try {
      const { data, error } = await supabase
        .from('complaint_notes')
        .insert({
          complaint_id: complaintId,
          note_text: noteText,
          created_by_name: staffName,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        logger.error('Add note error:', error);
        return { success: false, error: 'Failed to add note' };
      }

      logger.info(`Note added to complaint ${complaintId}`);
      return { success: true, note: data };
    } catch (error) {
      logger.error('Add note error:', error);
      return { success: false, error: 'Failed to add note' };
    }
  },

  /**
   * Schedule field visit
   */
  scheduleFieldVisit: async (complaintId, visitDate, visitTime, location, visitType) => {
    try {
      const { data, error } = await supabase
        .from('field_visits')
        .insert({
          complaint_id: complaintId,
          visit_date: visitDate,
          visit_time: visitTime,
          location: location,
          visit_type: visitType,
          status: 'scheduled',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        logger.error('Schedule visit error:', error);
        return { success: false, error: 'Failed to schedule visit' };
      }

      logger.info(`Field visit scheduled for complaint ${complaintId}`);
      return { success: true, visit: data };
    } catch (error) {
      logger.error('Schedule visit error:', error);
      return { success: false, error: 'Failed to schedule visit' };
    }
  },

  /**
   * Complete field visit
   */
  completeFieldVisit: async (visitId, findings) => {
    try {
      const { data, error } = await supabase
        .from('field_visits')
        .update({
          status: 'completed',
          findings: findings,
          updated_at: new Date().toISOString()
        })
        .eq('id', visitId)
        .select()
        .single();

      if (error) {
        logger.error('Complete visit error:', error);
        return { success: false, error: 'Failed to complete visit' };
      }

      logger.info(`Field visit ${visitId} completed`);
      return { success: true, visit: data };
    } catch (error) {
      logger.error('Complete visit error:', error);
      return { success: false, error: 'Failed to complete visit' };
    }
  },

  /**
   * Get staff dashboard summary
   */
  getStaffDashboard: async (staffId) => {
    try {
      const { data: assignments, error: assignmentError } = await supabase
        .from('staff_assignments')
        .select('complaint_id, complaints (status)')
        .eq('staff_id', staffId)
        .eq('status', 'active');

      if (assignmentError) {
        return { success: false, error: 'Failed to fetch dashboard' };
      }

      const { data: performance } = await supabase
        .from('staff_performance')
        .select('*')
        .eq('staff_id', staffId)
        .single();

      // Calculate status breakdown
      const statusBreakdown = {
        assigned: 0,
        in_progress: 0,
        resolved: 0,
        pending_review: 0
      };

      assignments.forEach(a => {
        const status = a.complaints?.status || 'unknown';
        if (statusBreakdown.hasOwnProperty(status)) {
          statusBreakdown[status]++;
        }
      });

      return {
        success: true,
        summary: {
          total_assigned: assignments.length,
          ...statusBreakdown,
          performance: performance || {
            customer_satisfaction_score: 0,
            sla_achievement_rate: 0,
            on_time_completion_rate: 0
          }
        }
      };
    } catch (error) {
      logger.error('Get dashboard error:', error);
      return { success: false, error: 'Failed to get dashboard' };
    }
  }
};
