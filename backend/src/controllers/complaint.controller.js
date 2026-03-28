const supabase = require('../config/supabase');
const pythonService = require('../services/python.service');
const logger = require('../utils/logger');

exports.createComplaint = async (req, res, next) => {
  try {
    const { title, description, category } = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('complaints')
      .insert([{
        user_id: userId,
        title,
        description,
        category,
        status: 'new',
        priority: 'medium',
      }])
      .select();

    if (error) throw error;

    // Send to Python service for AI analysis
    pythonService.processComplaint(data[0].id, {
      title,
      description,
      category,
    }).catch(err => logger.error('AI processing error:', err));

    res.status(201).json(data[0]);
  } catch (error) {
    next(error);
  }
};

exports.getUserComplaints = async (req, res, next) => {
  try {
    const userId = req.user.id;
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
};

exports.getAllComplaints = async (req, res, next) => {
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
};

exports.getComplaintById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.updateComplaintStatus = async (req, res, next) => {
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
};

exports.deleteComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('complaints')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
