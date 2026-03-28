import { supabase } from '../config/supabase.js';

export const complianceController = {
  list: async (_req, res) => {
    try {
      const { data, error } = await supabase
        .from('compliance_records')
        .select('id, title, status, last_checked, description')
        .order('last_checked', { ascending: false });

      if (error) {
        if ((error.message || '').toLowerCase().includes('relation') && (error.message || '').toLowerCase().includes('compliance_records')) {
          return res.json([]);
        }
        return res.status(500).json({ error: 'Failed to fetch compliance records' });
      }

      return res.json(data || []);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch compliance records' });
    }
  }
};
