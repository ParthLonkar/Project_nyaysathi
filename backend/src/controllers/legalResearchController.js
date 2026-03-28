import { supabase } from '../config/supabase.js';

export const legalResearchController = {
  search: async (req, res) => {
    try {
      const { q, category } = req.query;

      let query = supabase
        .from('legal_research')
        .select('title, summary, category, source')
        .limit(50);

      if (q) {
        query = query.or(`title.ilike.%${q}%,summary.ilike.%${q}%`);
      }

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        if ((error.message || '').toLowerCase().includes('relation') && (error.message || '').toLowerCase().includes('legal_research')) {
          return res.json([]);
        }
        return res.status(500).json({ error: 'Failed to fetch legal research' });
      }

      return res.json(data || []);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch legal research' });
    }
  }
};
