const pythonService = require('../services/python.service');
const supabase = require('../config/supabase');
const logger = require('../utils/logger');

exports.processComplaint = async (req, res, next) => {
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
};

exports.getProcessingStatus = async (req, res, next) => {
  try {
    const { complaintId } = req.params;
    const status = await pythonService.getProcessingStatus(complaintId);
    res.json(status);
  } catch (error) {
    next(error);
  }
};

exports.escalateComplaint = async (req, res, next) => {
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
};
