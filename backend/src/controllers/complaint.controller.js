import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export const complaintController = {
  createComplaint: async (req, res, next) => {
    try {
      console.log('Incoming complaint body:', req.body);
      const { title, description, location, userId } = req.body || {};
      const resolvedUserId = userId || 'demo-user';

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
            required: ['title', 'description', 'location', 'userId'],
          },
        });
      }

      let aiResult;
      try {
        const aiResponse = await axios.post('http://localhost:8000/process-complaint', {
          text: description,
          location,
        }, {
          timeout: 30000,
        });
        aiResult = aiResponse.data;
      } catch (aiError) {
        logger.error('Failed to process complaint with AI service:', aiError);
        return res.status(502).json({
          error: {
            status: 502,
            message: 'Failed to process complaint with AI service',
          },
        });
      }

      const complaintPayload = {
        user_id: resolvedUserId,
        title,
        description,
        category: 'general',
        status: 'new',
        priority: typeof aiResult?.priority === 'string' ? aiResult.priority : 'medium',
        ai_analysis: {
          ...aiResult,
          input: {
            text: description,
            location,
          },
        },
      };

      const { data, error } = await supabase
        .from('complaints')
        .insert([complaintPayload])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({
        success: true,
        caseId: data.id,
        aiResult,
      });
    } catch (error) {
      next(error);
    }
  },

  getUserComplaints: async (req, res, next) => {
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
      const { error } = await supabase
        .from('complaints')
        .delete()
        .eq('id', id);

      if (error) throw error;
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
