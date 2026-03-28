import axios from 'axios';
import { logger } from '../utils/logger.js';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

const pythonClient = axios.create({
  baseURL: PYTHON_SERVICE_URL,
  timeout: 30000, // 30 seconds
});

const buildEscalationReasoning = ({ category, priority, text }) => {
  const textLower = (text || '').toLowerCase();

  if (priority === 'high') {
    return 'High-priority grievance detected. Escalate quickly if initial action is delayed.';
  }

  if (textLower.includes('corruption') || textLower.includes('bribe')) {
    return 'Potential corruption signal found. Escalate to higher authority for review.';
  }

  if (category === 'water' || category === 'sanitation') {
    return 'Essential civic service issue. Escalate if SLA is breached.';
  }

  return 'Escalate only if unresolved after standard departmental cycle.';
};

const normalizeAIResult = (aiData, sourceText = '', sourceLocation = '') => {
  const category = aiData?.category || 'general';
  const priority = aiData?.priority || 'medium';

  const recommendedActions = Array.isArray(aiData?.recommended_actions)
    ? aiData.recommended_actions
    : [
      'Register the grievance and assign an owner.',
      'Track progress against SLA and update citizen.',
      'Escalate if unresolved in time.',
    ];

  return {
    category,
    department: aiData?.department || 'Municipal Grievance Cell',
    priority,
    legal_strategy: aiData?.legal_strategy || 'Document issue, assign department, and enforce SLA-based follow-up.',
    summary: aiData?.summary || `Complaint received for ${sourceLocation || 'the reported location'}.`,
    recommended_actions: recommendedActions,
    admin_brief: aiData?.admin_brief || 'Assign to department and monitor SLA checkpoints.',
    staff_action_note: aiData?.staff_action_note || 'Verify the complaint and update first action status.',
    citizen_update: aiData?.citizen_update || 'Your complaint is registered and under review.',
    escalation_risk: aiData?.escalation_risk || buildEscalationReasoning({ category, priority, text: sourceText }),
    manual_review: aiData?.manual_review === true,
  };
};

const buildFallbackAIResult = (sourceText = '', sourceLocation = '', reason = '') => {
  return normalizeAIResult({
    category: 'general',
    department: 'Municipal Grievance Cell',
    priority: 'medium',
    legal_strategy: 'Route for manual triage and department assignment.',
    summary: `Fallback AI response used for complaint at ${sourceLocation || 'unknown location'}.`,
    recommended_actions: [
      'Assign complaint to intake desk for manual review.',
      'Confirm category and department assignment.',
      'Update citizen with initial action timeline.',
    ],
    admin_brief: 'AI unavailable. Manual triage required before assignment.',
    staff_action_note: 'Perform first-level verification and set next follow-up date.',
    citizen_update: 'Your complaint is submitted and queued for manual review.',
    escalation_risk: 'Escalate if no departmental action is recorded within SLA window.',
    manual_review: true,
    fallback_reason: reason || 'AI service unavailable',
  }, sourceText, sourceLocation);
};

export const pythonService = {
  buildEscalationReasoning,
  normalizeAIResult,
  buildFallbackAIResult,

  callAIService: async (data) => {
    try {
      const response = await axios.post(`${PYTHON_SERVICE_URL}/process-complaint`, data, {
        timeout: 30000,
      });
      return normalizeAIResult(response.data, data?.text, data?.location);
    } catch (error) {
      logger.error('AI service call failed:', error.message);

      const message = error.response?.data?.detail
        || error.response?.data?.message
        || 'Failed to call AI service';

      const wrappedError = new Error(message);
      wrappedError.status = error.response?.status || 502;
      throw wrappedError;
    }
  },

  processComplaint: async (complaintId, complaintData) => {
    try {
      logger.info(`Sending complaint ${complaintId} to Python service`);
      
      const response = await pythonClient.post('/api/process', {
        complaint_id: complaintId,
        ...complaintData,
      });

      return response.data;
    } catch (error) {
      logger.error('Python service error:', error.message);
      throw new Error('Failed to process complaint with AI service');
    }
  },

  getProcessingStatus: async (complaintId) => {
    try {
      const response = await pythonClient.get(`/api/status/${complaintId}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get processing status:', error.message);
      throw error;
    }
  },

  escalateComplaint: async (complaintId, reason) => {
    try {
      const response = await pythonClient.post(`/api/escalate`, {
        complaint_id: complaintId,
        reason,
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to escalate complaint:', error.message);
      throw error;
    }
  }
};
