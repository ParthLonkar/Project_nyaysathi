const supabase = require('../config/supabase');

exports.createSupabaseEntry = async (table, data) => {
  const { data: result, error } = await supabase
    .from(table)
    .insert([data])
    .select();

  if (error) throw error;
  return result[0];
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
