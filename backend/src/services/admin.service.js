import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';
import { authService } from './auth.service.js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

function writeClient() {
  return supabaseAdmin || supabase;
}

function pickRoutingInfo(complaint) {
  const ai = complaint?.ai_analysis || {};
  return ai.routing_info || ai.routing || {};
}

function extractAgentDetails(complaint) {
  const ai = complaint?.ai_analysis || {};
  const routing = pickRoutingInfo(complaint);

  return {
    department: routing.departmentName || ai.department || 'Pending routing',
    department_code: routing.departmentCode || routing.department_code || null,
    priority_score: routing.priorityScore || null,
    legal_strategy: ai.legal_strategy || null,
    summary: ai.summary || null,
    recommended_actions: Array.isArray(ai.recommended_actions) ? ai.recommended_actions : [],
    escalation_risk: ai.escalation_risk || null,
    sla_days: routing.sla || null,
    agent_flow: ai.agent_flow || null,
  };
}

function buildDefaultAnalytics(complaints = []) {
  const total = complaints.length;
  const pending = complaints.filter((c) => ['new', 'routed', 'received', 'assigned'].includes(c.status)).length;
  const inProgress = complaints.filter((c) => ['processing', 'in_progress'].includes(c.status)).length;
  const resolved = complaints.filter((c) => c.status === 'resolved').length;

  const slaValues = complaints
    .map((c) => extractAgentDetails(c).sla_days)
    .filter((v) => typeof v === 'number' && Number.isFinite(v));

  const avgSla = slaValues.length ? Math.round(slaValues.reduce((a, b) => a + b, 0) / slaValues.length) : 0;
  const slaCompliance = total > 0 ? Math.round(((resolved + inProgress) / total) * 100) : 0;

  return {
    total_complaints: total,
    complaints_pending: pending,
    complaints_in_progress: inProgress,
    complaints_resolved: resolved,
    average_resolution_days: avgSla,
    sla_compliance_rate: slaCompliance,
  };
}

export const adminService = {
  getDepartmentComplaints: async (_departmentId, filters = {}) => {
    try {
      const { status, priority } = filters;
      const baseSelect = 'id, user_id, title, description, category, status, priority, ai_analysis, created_at, submitted_at';

      const applyFilters = (queryBuilder) => {
        let q = queryBuilder;
        if (status) q = q.eq('status', status);
        if (priority) q = q.eq('priority', priority);
        return q;
      };

      let response = await applyFilters(
        supabase.from('complaints').select(baseSelect).order('created_at', { ascending: false })
      );

      if (response.error) {
        logger.warn('Get complaints fallback to submitted_at order:', response.error.message);
        response = await applyFilters(
          supabase.from('complaints').select(baseSelect).order('submitted_at', { ascending: false })
        );
      }

      if (response.error) {
        logger.warn('Get complaints fallback to unordered select:', response.error.message);
        response = await applyFilters(supabase.from('complaints').select(baseSelect));
      }

      const { data, error } = response;
      if (error) {
        logger.error('Get complaints error:', error);
        return { success: false, error: 'Failed to fetch complaints' };
      }

      const complaints = (data || []).map((complaint) => ({
        ...complaint,
        agent_details: extractAgentDetails(complaint),
      }));

      return { success: true, complaints };
    } catch (error) {
      logger.error('Get complaints error:', error);
      return { success: false, error: 'Failed to fetch complaints' };
    }
  },

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

  assignComplaintToStaff: async (complaintId, staffId, adminId, departmentId, notes = '') => {
    try {
      const db = writeClient();

      if (!supabaseAdmin) {
        logger.warn('SUPABASE_SERVICE_ROLE_KEY is not configured; assignment writes may fail under RLS.');
      }

      const { data: assignment, error: assignError } = await db
        .from('staff_assignments')
        .insert({
          complaint_id: complaintId,
          staff_id: staffId,
          admin_id: adminId,
          department_id: departmentId,
          assignment_notes: notes,
          status: 'active',
        })
        .select()
        .single();

      if (assignError) {
        const msg = String(assignError.message || '').toLowerCase();
        const isRls = msg.includes('row-level security') || assignError.code === '42501';
        logger.error('Assign complaint error:', assignError);

        if (isRls) {
          return {
            success: false,
            error:
              'Assignment blocked by Supabase RLS. Configure SUPABASE_SERVICE_ROLE_KEY in backend/.env or add INSERT policy for staff_assignments.',
          };
        }

        return { success: false, error: 'Failed to assign complaint' };
      }

      const { error: updateError } = await db
        .from('complaints')
        .update({
          assigned_staff_id: staffId,
          status: 'assigned',
        })
        .eq('id', complaintId);

      if (updateError) {
        logger.error('Update complaint error:', updateError);
        return { success: false, error: 'Failed to update complaint' };
      }

      const { data: staffData } = await db
        .from('department_staff')
        .select('complaints_assigned')
        .eq('id', staffId)
        .single();

      if (staffData) {
        await db
          .from('department_staff')
          .update({ complaints_assigned: (staffData.complaints_assigned || 0) + 1 })
          .eq('id', staffId);
      }

      logger.info(`Complaint ${complaintId} assigned to staff ${staffId}`);
      return { success: true, assignment };
    } catch (error) {
      logger.error('Assign complaint error:', error);
      return { success: false, error: 'Failed to assign complaint' };
    }
  },

  createStaff: async (staffData, departmentId, adminId) => {
    try {
      const result = await authService.createStaff({
        ...staffData,
        department_id: departmentId,
        admin_id: adminId,
      });

      if (!result.success) return result;

      logger.info(`Staff ${staffData.username} created by admin`);
      return result;
    } catch (error) {
      logger.error('Create staff error:', error);
      return { success: false, error: 'Failed to create staff' };
    }
  },

  deactivateStaff: async (staffId) => {
    try {
      const { error } = await writeClient()
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

  getDepartmentAnalytics: async (departmentId) => {
    try {
      const complaintsResult = await adminService.getDepartmentComplaints(departmentId, {});
      const complaints = complaintsResult.success ? complaintsResult.complaints : [];
      const fallbackAnalytics = buildDefaultAnalytics(complaints);

      const { data: analyticsRows, error } = await supabase
        .from('department_analytics')
        .select('*')
        .eq('department_id', departmentId)
        .limit(1);

      const analytics = Array.isArray(analyticsRows) ? analyticsRows[0] : null;

      if (error) {
        logger.warn('Department analytics table/data unavailable, using computed fallback:', error.message);
        return { success: true, analytics: fallbackAnalytics, source: 'computed' };
      }

      return {
        success: true,
        analytics: {
          ...fallbackAnalytics,
          ...analytics,
        },
        source: 'table+computed',
      };
    } catch (error) {
      logger.error('Get analytics error:', error);
      return {
        success: true,
        analytics: buildDefaultAnalytics([]),
        source: 'empty-fallback',
      };
    }
  },

  getDashboardSummary: async (departmentId) => {
    try {
      const complaintsResult = await adminService.getDepartmentComplaints(departmentId, {});
      const complaints = complaintsResult.success ? complaintsResult.complaints : [];

      const { data: staff, error: staffError } = await supabase
        .from('department_staff')
        .select('id, is_active')
        .eq('department_id', departmentId);

      if (staffError) {
        return { success: false, error: 'Failed to fetch data' };
      }

      const stats = {
        total_complaints: complaints.length,
        pending: complaints.filter((c) => ['routed', 'received', 'assigned', 'new'].includes(c.status)).length,
        in_progress: complaints.filter((c) => c.status === 'in_progress' || c.status === 'processing').length,
        resolved: complaints.filter((c) => c.status === 'resolved').length,
        total_staff: staff.length,
        active_staff: staff.filter((s) => s.is_active).length,
      };

      return { success: true, stats };
    } catch (error) {
      logger.error('Get summary error:', error);
      return { success: false, error: 'Failed to fetch summary' };
    }
  },

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
  },
};
