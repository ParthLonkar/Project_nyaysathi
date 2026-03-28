import { logger } from '../utils/logger.js';
import { supabaseAdmin } from '../config/supabase.js';

const DEFAULT_STATUS = 'new';

const normalizePriority = (value) => {
  const priority = String(value || 'medium').toLowerCase();
  if (['high', 'medium', 'low'].includes(priority)) return priority;
  return 'medium';
};

const buildAdminClassification = ({ manualReview, priority }) => {
  if (manualReview) return 'Needs Review';
  if (priority === 'high') return 'Urgent';
  return 'Standard';
};

const buildRoutingInfo = ({ routingDecision = {}, aiResult = {} }) => {
  const departmentName = aiResult?.department || routingDecision?.departmentName || 'Municipal Grievance Cell';

  return {
    ...routingDecision,
    departmentName,
    department_name: departmentName,
    category: aiResult?.category || routingDecision?.category || 'general',
    priority: normalizePriority(aiResult?.priority || routingDecision?.priority),
    routedBy: 'action_agent',
    routedAt: new Date().toISOString(),
  };
};

const buildTimelineNote = (departmentName) => `Complaint submitted and routed to ${departmentName}`;

export const actionAgentService = {
  buildActionPlan: ({ aiResult = {}, routingDecision = {} }) => {
    const priority = normalizePriority(aiResult?.priority || routingDecision?.priority);
    const manualReview = aiResult?.manual_review === true;
    const routingInfo = buildRoutingInfo({ routingDecision, aiResult });
    const escalationFlag = String(aiResult?.escalation_risk || '').toLowerCase() === 'high';
    const isUrgent = priority === 'high';
    const adminClassification = buildAdminClassification({ manualReview, priority });

    return {
      status: DEFAULT_STATUS,
      progress_percentage: 0,
      priority,
      manual_review: manualReview,
      escalation_flag: escalationFlag,
      is_urgent: isUrgent,
      admin_classification: adminClassification,
      routing_info: routingInfo,
      timeline_note: buildTimelineNote(routingInfo.departmentName),
    };
  },

  createTimelineEntry: async ({ complaintId, note, status, oldStatus = null }) => {
    try {
      const { error } = await supabaseAdmin
        .from('status_history')
        .insert({
          complaint_id: complaintId,
          old_status: oldStatus,
          new_status: status || DEFAULT_STATUS,
          notes: note,
          created_at: new Date().toISOString(),
        });

      if (error) {
        logger.warn(`Action Agent timeline insert failed for complaint ${complaintId}:`, error.message);
        return false;
      }

      logger.info(`Action Agent timeline inserted for complaint ${complaintId}`);
      return true;
    } catch (error) {
      logger.warn(`Action Agent timeline insert error for complaint ${complaintId}:`, error.message);
      return false;
    }
  },

  createInitialTimelineEntry: async ({ complaintId, note, status }) => {
    return actionAgentService.createTimelineEntry({
      complaintId,
      note,
      status,
      oldStatus: null,
    });
  },
};
