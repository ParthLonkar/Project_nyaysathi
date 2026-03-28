const supabase = require('../config/supabase');
const { randomUUID } = require('crypto');

exports.createSupabaseEntry = async (table, data) => {
  const { data: result, error } = await supabase
    .from(table)
    .insert([data])
    .select();

  if (error) throw error;
  return result[0];
};

exports.saveComplaint = async (data) => {
  const complaint = {
    id: data.id || randomUUID(),
    title: data.title,
    description: data.description,
    location: data.location,
    category: data.category,
    department: data.department,
    priority: data.priority,
    status: data.status || 'submitted',
    created_at: data.created_at || new Date().toISOString(),
  };

  const { data: result, error } = await supabase
    .from('complaints')
    .insert([complaint])
    .select()
    .single();

  if (error) throw error;
  return result;
};

exports.updateSupabaseEntry = async (table, id, data) => {
  const { data: result, error } = await supabase
    .from(table)
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return result;
};

exports.getSupabaseEntry = async (table, id) => {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

exports.deleteSupabaseEntry = async (table, id) => {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);

  if (error) throw error;
};
