import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';
import { authService } from './auth.service.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

function writeClient() {
  return supabaseAdmin || supabase;
}

function isRlsError(errorLike) {
  const message = errorLike?.message || String(errorLike || '');
  return message.toLowerCase().includes('row-level security policy');
}

function pickRoutingInfo(complaint) {
  const ai = complaint?.ai_analysis || {};
  return ai.routing_info || ai.routing || complaint?.routing_info || {};
}

function extractAgentDetails(complaint) {
  const ai = complaint?.ai_analysis || {};
  const routing = pickRoutingInfo(complaint);

  return {
    department: routing.departmentName || ai.department || complaint?.department || 'Pending routing',
    department_code: routing.departmentCode || routing.department_code || null,
    priority_score: ai.priority_score || routing.priorityScore || null,
    priority: ai.priority || routing.priority || complaint?.priority || 'medium',
    legal_strategy: ai.legal_strategy || null,
    summary: ai.summary || null,
    recommended_actions: Array.isArray(ai.recommended_actions) ? ai.recommended_actions : [],
    escalation_risk: ai.escalation_risk || null,
    escalation_needed: ai.escalation_needed === true,
    compliance_check: ai.compliance_check || null,
    legal_analysis: ai.legal_analysis || null,
    complaint_draft: ai.complaint_draft || null,
    rti_draft: ai.rti_draft || null,
    document_valid: ai.document_valid === true,
    document_notes: ai.document_notes || null,
    sla_days: routing.sla || null,
    agent_flow: ai.agent_flow || null,
  };
}

function groupDocumentsByComplaint(documents = []) {
  return documents.reduce((acc, doc) => {
    if (!doc?.complaint_id) return acc;
    if (!acc[doc.complaint_id]) acc[doc.complaint_id] = [];
    acc[doc.complaint_id].push(doc);
    return acc;
  }, {});
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
      const baseSelect = 'id, user_id, title, description, category, status, priority, ai_analysis, routing_info, created_at, submitted_at';

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

      const complaintIds = (data || []).map((row) => row.id).filter(Boolean);
      let documentsByComplaint = {};

      if (complaintIds.length > 0) {
        const { data: documentRows, error: documentsError } = await supabase
          .from('complaint_documents')
          .select('id, complaint_id, document_type, file_name, storage_path, public_url, created_at')
          .in('complaint_id', complaintIds);

        if (documentsError) {
          logger.warn('Get complaint documents warning:', documentsError.message);
        } else {
          documentsByComplaint = groupDocumentsByComplaint(documentRows || []);
        }
      }

      const complaints = (data || []).map((complaint) => ({
        ...complaint,
        agent_details: extractAgentDetails(complaint),
        documents: documentsByComplaint[complaint.id] || complaint?.ai_analysis?.documents || [],
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
      const client = writeClient();

      const { data: assignment, error: assignError } = await client
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
        logger.error('Assign complaint error:', assignError);
        if (isRlsError(assignError)) {
          return {
            success: false,
            error: 'Assignment blocked by Supabase RLS. Configure SUPABASE_SERVICE_ROLE_KEY in backend/.env or add INSERT policy for staff_assignments.',
          };
        }
        return { success: false, error: 'Failed to assign complaint' };
      }

      // Fetch RTI PDF and other documents for inclusion in assignment notification
      try {
        const { data: documents } = await supabase
          .from('complaint_documents')
          .select('id, document_type, file_name, public_url, storage_path')
          .eq('complaint_id', complaintId)
          .in('document_type', ['rti_pdf', 'complaint_pdf']);

        if (documents && documents.length > 0) {
          const rtiDoc = documents.find(d => d.document_type === 'rti_pdf');
          if (rtiDoc) {
            logger.info(`RTI PDF attached to staff assignment: ${rtiDoc.file_name} (${rtiDoc.public_url})`);
          }
        }
      } catch (docError) {
        logger.warn('Failed to fetch documents for assignment notification:', docError.message);
      }

      const { error: updateError } = await client
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

      const { data: staffData } = await supabase
        .from('department_staff')
        .select('complaints_assigned')
        .eq('id', staffId)
        .single();

      if (staffData) {
        await client
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

  getDailyReport: async (departmentId, reportDate) => {
    try {
      logger.info(`Generating daily report for date: ${reportDate}`);

      // Parse the date to get start and end of day
      const startOfDay = new Date(reportDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(reportDate);
      endOfDay.setHours(23, 59, 59, 999);

      const startIso = startOfDay.toISOString();
      const endIso = endOfDay.toISOString();

      // Fetch complaints with error handling
      let allComplaints = [];
      
      try {
        const { data, error } = await supabase
          .from('complaints')
          .select('id, title, description, category, status, priority, created_at, updated_at, resolved_at, assigned_staff_id, ai_analysis')
          .order('created_at', { ascending: false });

        if (!error && data) {
          allComplaints = data;
        } else {
          logger.warn('Complaints fetch error:', error?.message);
          allComplaints = [];
        }
      } catch (err) {
        logger.error('Exception fetching complaints:', err);
        allComplaints = [];
      }

      // Filter complaints for the specific day
      const dailyComplaints = (allComplaints || []).filter(complaint => {
        try {
          if (!complaint.created_at) return false;
          const complaintDate = new Date(complaint.created_at);
          return complaintDate >= startOfDay && complaintDate <= endOfDay;
        } catch (e) {
          return false;
        }
      });

      logger.info(`Found ${dailyComplaints.length} complaints for the day`);

      // Build staff map (try to fetch but don't fail if unavailable)
      const staffMap = {};
      try {
        const { data: staffList, error: staffError } = await supabase
          .from('department_staff')
          .select('id, staff_name, position, email, phone');

        if (!staffError && staffList && Array.isArray(staffList)) {
          staffList.forEach(staff => {
            if (staff && staff.id) {
              staffMap[staff.id] = staff;
            }
          });
        }
      } catch (err) {
        logger.warn('Staff fetch failed (non-blocking):', err.message);
        // Continue without staff data
      }

      // Calculate statistics
      const statusBreakdown = {};
      const severityBreakdown = {};
      const categoryBreakdown = {};
      const assignedToStaff = {};
      const escalatedComplaints = [];
      let totalResolutionTime = 0;
      let resolvedCount = 0;

      dailyComplaints.forEach(complaint => {
        try {
          // Status breakdown
          const status = String(complaint.status || 'new').toLowerCase();
          statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;

          // Priority/Severity breakdown
          const priority = String(complaint.priority || 'medium').toLowerCase();
          severityBreakdown[priority] = (severityBreakdown[priority] || 0) + 1;

          // Category breakdown
          const category = String(complaint.category || 'uncategorized');
          categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;

          // Staff assignment
          if (complaint.assigned_staff_id) {
            assignedToStaff[complaint.assigned_staff_id] = (assignedToStaff[complaint.assigned_staff_id] || 0) + 1;
          }

          // Escalated complaints
          const isEscalated = priority === 'high' || complaint.ai_analysis?.escalation_needed === true;
          if (isEscalated) {
            escalatedComplaints.push(complaint);
          }

          // Calculate average resolution time
          if ((status === 'resolved' || status === 'closed') && complaint.resolved_at) {
            const createdDate = new Date(complaint.created_at);
            const resolvedDate = new Date(complaint.resolved_at);
            const resolutionTime = (resolvedDate - createdDate) / (1000 * 60 * 60 * 24);
            if (resolutionTime >= 0 && Number.isFinite(resolutionTime)) {
              totalResolutionTime += resolutionTime;
              resolvedCount++;
            }
          }
        } catch (itemErr) {
          logger.warn('Error processing complaint:', itemErr.message);
        }
      });

      const avgResolutionTime = resolvedCount > 0 ? parseFloat((totalResolutionTime / resolvedCount).toFixed(2)) : 0;

      const reportDateFormatted = reportDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const report = {
        success: true,
        report: {
          reportDate: reportDateFormatted,
          reportDateISO: reportDate.toISOString().split('T')[0],
          totalComplaintsReceived: dailyComplaints.length,
          statusBreakdown,
          severityBreakdown,
          categoryBreakdown,
          staffAssignments: assignedToStaff,
          staffDetails: staffMap,
          escalatedComplaints: escalatedComplaints.slice(0, 20),
          kpis: {
            averageResolutionTime: avgResolutionTime,
            totalResolved: resolvedCount,
            slaComplianceRate: dailyComplaints.length > 0 ? Math.round((resolvedCount / dailyComplaints.length) * 100) : 0,
          },
          detailedComplaints: dailyComplaints.map(c => ({
            id: c.id || 'N/A',
            title: c.title || 'No Title',
            description: String(c.description || 'N/A').substring(0, 100),
            category: c.category || 'General',
            status: c.status || 'pending',
            priority: c.priority || 'medium',
            createdAt: c.created_at ? new Date(c.created_at).toLocaleString() : 'Unknown',
            assignedTo: staffMap[c.assigned_staff_id]?.staff_name || 'Unassigned',
            assignedEmail: staffMap[c.assigned_staff_id]?.email || 'N/A',
            actionTaken: Array.isArray(c.ai_analysis?.recommended_actions) ? c.ai_analysis.recommended_actions.join(', ') : 'Pending',
          })).slice(0, 100),
        },
      };

      logger.info('Daily report generated successfully');
      return report;
    } catch (error) {
      logger.error('getDailyReport error:', error);
      return { success: false, error: 'Failed to generate daily report: ' + error.message };
    }
  },

  /**
   * Get RTI PDF for a specific complaint
   */
  getRtiPdf: async (complaintId, departmentId) => {
    try {
      // First verify the complaint belongs to the department
      const { data: complaint, error: complaintError } = await supabase
        .from('complaints')
        .select('id, reference_id')
        .eq('id', complaintId)
        .single();

      if (complaintError || !complaint) {
        logger.warn(`Complaint ${complaintId} not found or error:`, complaintError?.message);
        return { success: false, error: 'Complaint not found' };
      }

      // Fetch the RTI PDF document
      const { data: documents, error: docError } = await supabase
        .from('complaint_documents')
        .select('id, document_type, file_name, storage_path, public_url, created_at')
        .eq('complaint_id', complaintId)
        .eq('document_type', 'rti_pdf')
        .order('created_at', { ascending: false })
        .limit(1);

      if (docError) {
        logger.error('Error fetching RTI PDF:', docError.message);
        return { success: false, error: 'Failed to fetch RTI PDF' };
      }

      if (!documents || documents.length === 0) {
        logger.warn(`No RTI PDF found for complaint ${complaintId}`);
        return { success: false, error: 'RTI PDF not found for this complaint' };
      }

      const rtiPdf = documents[0];
      logger.info(`RTI PDF retrieved for complaint ${complaintId}: ${rtiPdf.file_name}`);

      return {
        success: true,
        documentId: rtiPdf.id,
        fileName: rtiPdf.file_name,
        pdfUrl: rtiPdf.public_url,
        storagePath: rtiPdf.storage_path,
        createdAt: rtiPdf.created_at
      };
    } catch (error) {
      logger.error('Get RTI PDF error:', error);
      return { success: false, error: 'Failed to retrieve RTI PDF' };
    }
  },
};
