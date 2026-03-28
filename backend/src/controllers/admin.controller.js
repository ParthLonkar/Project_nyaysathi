const supabase = require('../config/supabase');

exports.getUsers = async (req, res, next) => {
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;
    res.json(data.users);
  } catch (error) {
    next(error);
  }
};

exports.getComplaintStats = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('complaints')
      .select('status, priority', { count: 'exact' });

    if (error) throw error;

    const stats = {
      total: data.length,
      byStatus: {},
      byPriority: {},
    };

    data.forEach(item => {
      stats.byStatus[item.status] = (stats.byStatus[item.status] || 0) + 1;
      stats.byPriority[item.priority] = (stats.byPriority[item.priority] || 0) + 1;
    });

    res.json(stats);
  } catch (error) {
    next(error);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const { data, error } = await supabase
      .from('user_roles')
      .update({ role })
      .eq('user_id', id)
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
