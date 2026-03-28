import axios from 'axios';
import { logger } from '../utils/logger.js';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
const AI_TIMEOUT_MS = Number(process.env.AI_SERVICE_TIMEOUT_MS || 45000);

const pythonClient = axios.create({
  baseURL: PYTHON_SERVICE_URL,
  timeout: AI_TIMEOUT_MS,
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
    complaint_draft: aiData?.complaint_draft || '',
    rti_draft: aiData?.rti_draft || '',
    complaint_pdf: aiData?.complaint_pdf || null,
    rti_pdf: aiData?.rti_pdf || null,
    document_valid: aiData?.document_valid === true,
    document_notes: aiData?.document_notes || '',
    legal_analysis: aiData?.legal_analysis || {},
    compliance_check: aiData?.compliance_check || {},
    priority_score: typeof aiData?.priority_score === 'number' ? aiData.priority_score : null,
    escalation_needed: aiData?.escalation_needed === true,
    agent_flow: aiData?.agent_flow || {},
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
    complaint_draft: `Subject: Complaint regarding civic issue in ${sourceLocation || 'the reported area'}\n\nTo: Municipal Grievance Cell\n\nComplaint Details:\n${sourceText || 'Complaint details not available.'}\n\nRequested Action:\nPlease review and route this complaint manually.`,
    rti_draft: 'To: Public Information Officer\n\nSubject: Request for information under RTI\n\nInformation requested:\nAction taken report and responsible officer details.\n\nApplicant details:\nNot provided',
    document_valid: true,
    document_notes: 'Fallback draft generated due to AI service failure.',
    fallback_reason: reason || 'AI service unavailable',
  }, sourceText, sourceLocation);
};

export const pythonService = {
  buildEscalationReasoning,
  normalizeAIResult,
  buildFallbackAIResult,

  callAIService: async (data) => {
    const requestStartedAt = Date.now();
    try {
      logger.info(
        'AI request start',
        JSON.stringify({
          endpoint: `${PYTHON_SERVICE_URL}/process-complaint`,
          timeoutMs: AI_TIMEOUT_MS,
          hasText: Boolean(data?.text),
          hasLocation: Boolean(data?.location),
        })
      );

      const response = await pythonClient.post('/process-complaint', data);
      logger.info(
        'AI request success',
        JSON.stringify({
          durationMs: Date.now() - requestStartedAt,
          status: response?.status,
        })
      );
      return normalizeAIResult(response.data, data?.text, data?.location);
    } catch (error) {
      logger.error(
        'AI request failed',
        JSON.stringify({
          durationMs: Date.now() - requestStartedAt,
          status: error.response?.status || 502,
          error: error.message,
        })
      );

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

