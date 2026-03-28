import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';
import { pythonService } from '../services/python.service.js';
import {
  routeComplaint,
  generateRoutingRecommendations,
  checkEscalationNeed,
} from '../services/routing.service.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const CATEGORY_ALIAS = {
  water: 'general',
  sanitation: 'general',
  other: 'general',
};

function normalizeCategory(input = '') {
  const value = String(input || '').toLowerCase().trim();
  if (!value) return 'general';
  return CATEGORY_ALIAS[value] || value;
}

function buildWorkflowOutput({ title, description, location, category, respondentName, aiResult }) {
  const routing = routeComplaint({
    title,
    description,
    location,
    category,
    respondentName,
  });

  const recommendations = generateRoutingRecommendations({
    title,
    description,
    category,
  });

  const escalation = checkEscalationNeed({
    respondentName,
    description,
    category,
  });

  return {
    category,
    department: aiResult?.department || routing.departmentName,
    priority: routing.priority,
    summary: aiResult?.summary || `Complaint routed to ${routing.departmentName} for ${location || 'reported location'}.`,
    legal_strategy: aiResult?.legal_strategy || 'File grievance and seek written response with SLA follow-up.',
    recommended_actions: [...new Set([...(aiResult?.recommended_actions || []), ...recommendations])],
    staff_action_note: aiResult?.staff_action_note || 'Validate facts, contact citizen if required, and set first action update.',
    admin_brief: aiResult?.admin_brief || `Assign to ${routing.departmentName} and track SLA (${routing.sla} days).`,
    citizen_update: aiResult?.citizen_update || `Your complaint has been routed to ${routing.departmentName}.`,
    escalation_risk: aiResult?.escalation_risk || escalation.escalationReason,
    routing_info: {
      ...routing,
      recommendations,
      escalation,
    },
    agent_flow: {
      intake: 'completed',
      routing: 'completed',
      drafting: 'ready',
      compliance: 'ready',
      action: 'ready',
    },
  };
}

export const complaintController = {
  createComplaint: async (req, res, next) => {
    try {
      const {
        title,
        description,
        location,
        category: categoryFromRequest,
        respondentName = '',
        userId,
      } = req.body || {};

      const resolvedUserId = req.user?.id || userId || 'demo-user';

      const missingFields = [];
      if (!title) missingFields.push('title');
      if (!description) missingFields.push('description');
      if (!location) missingFields.push('location');

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: {
            status: 400,
            message: `Missing required field(s): ${missingFields.join(', ')}`,
            required: ['title', 'description', 'location'],
          },
        });
      }

      let aiResult;
      try {
        aiResult = await pythonService.callAIService({ text: description, location });
      } catch (aiError) {
        logger.warn('AI enrichment unavailable, using fallback response', aiError.message);
        aiResult = pythonService.buildFallbackAIResult(description, location, aiError.message);
      }

      const effectiveCategory = normalizeCategory(categoryFromRequest || aiResult?.category || 'general');
      const workflowOutput = buildWorkflowOutput({
        title,
        description,
        location,
        category: effectiveCategory,
        respondentName,
        aiResult,
      });

      const complaintPayload = {
        user_id: resolvedUserId,
        title,
        description,
        category: effectiveCategory,
        status: 'routed',
        priority: workflowOutput.priority || 'medium',
        ai_analysis: {
          ...aiResult,
          ...workflowOutput,
          input: {
            text: description,
            location,
            category: effectiveCategory,
            respondentName,
          },
        },
      };

      const { data, error } = await supabase.from('complaints').insert([complaintPayload]).select().single();
      if (error) throw error;

      res.status(201).json({
        success: true,
        caseId: data.id,
        complaint: data,
        aiResult: complaintPayload.ai_analysis,
      });
    } catch (error) {
      next(error);
    }
  },

  getUserComplaints: async (req, res, next) => {
    try {
      const userId = req.user?.id || req.query.userId || req.headers['x-user-id'];

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: {
            status: 400,
            message: 'userId is required. Provide login token or userId query/header.',
          },
        });
      }

      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  getAllComplaints: async (req, res, next) => {
    try {
      const { filter = 'all' } = req.query;
      let query = supabase.from('complaints').select('*');

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  getComplaintById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { data, error } = await supabase.from('complaints').select('*').eq('id', id).single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  updateComplaintStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const { data, error } = await supabase
        .from('complaints')
        .update({ status, updated_at: new Date() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  deleteComplaint: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { error } = await supabase.from('complaints').delete().eq('id', id);

      if (error) throw error;
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
