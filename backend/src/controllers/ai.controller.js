import { pythonService } from '../services/python.service.js';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export const aiController = {
  processComplaint: async (req, res, next) => {
    try {
      const { complaintId } = req.body;

      const { data: complaint, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('id', complaintId)
        .single();

      if (error) throw error;

      const analysisResult = await pythonService.processComplaint(complaintId, {
        title: complaint.title,
        description: complaint.description,
        category: complaint.category,
      });

      // Update complaint with AI analysis results
      const { data: updated, error: updateError } = await supabase
        .from('complaints')
        .update({
          ai_analysis: analysisResult,
          status: 'processing',
          priority: analysisResult.priority,
        })
        .eq('id', complaintId)
        .select()
        .single();

      if (updateError) throw updateError;
      res.json(updated);
    } catch (error) {
      next(error);
    }
  },

  getProcessingStatus: async (req, res, next) => {
    try {
      const { complaintId } = req.params;
      const status = await pythonService.getProcessingStatus(complaintId);
      res.json(status);
    } catch (error) {
      next(error);
    }
  },

  escalateComplaint: async (req, res, next) => {
    try {
      const { complaintId, reason } = req.body;

      const { data, error } = await supabase
        .from('complaints')
        .update({
          status: 'escalated',
          escalation_reason: reason,
          escalated_at: new Date(),
        })
        .eq('id', complaintId)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      next(error);
    }
  },
};
