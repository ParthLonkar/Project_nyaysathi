import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export const searchService = {
  /**
   * Search and filter complaints
   */
  searchComplaints: async (searchParams, userId, userType) => {
    try {
      let query = supabase.from('complaints').select('*');

      // Add filters based on parameters
      if (searchParams.title) {
        query = query.ilike('title', `%${searchParams.title}%`);
      }

      if (searchParams.status) {
        query = query.eq('status', searchParams.status);
      }

      if (searchParams.priority) {
        query = query.eq('priority', searchParams.priority);
      }

      if (searchParams.category) {
        query = query.eq('category', searchParams.category);
      }

      if (searchParams.location) {
        query = query.ilike('location', `%${searchParams.location}%`);
      }

      if (searchParams.startDate) {
        query = query.gte('created_at', searchParams.startDate);
      }

      if (searchParams.endDate) {
        query = query.lte('created_at', searchParams.endDate);
      }

      // Filter by department for staff
      if (userType === 'staff') {
        query = query.eq('assigned_staff_id', userId);
      } else if (userType === 'admin') {
        // Admin can see all complaints for their department
        query = query.eq('department_id', searchParams.departmentId);
      }

      // Sorting
      const orderBy = searchParams.sortBy || 'created_at';
      const orderDirection = searchParams.sortOrder === 'asc' ? false : true;
      query = query.order(orderBy, { ascending: !orderDirection });

      // Pagination
      const from = (searchParams.page || 1 - 1) * (searchParams.limit || 20);
      const to = from + (searchParams.limit || 20) - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        logger.error('Search complaints error:', error);
        return { success: false, error: 'Failed to search complaints', complaints: [] };
      }

      return {
        success: true,
        complaints: data || [],
        pagination: {
          total: count || 0,
          page: searchParams.page || 1,
          limit: searchParams.limit || 20,
          pages: Math.ceil((count || 0) / (searchParams.limit || 20))
        }
      };
    } catch (error) {
      logger.error('Search complaints error:', error);
      return { success: false, error: 'Failed to search complaints', complaints: [] };
    }
  },

  /**
   * Get complaint timeline/history
   */
  getComplaintTimeline: async (complaintId) => {
    try {
      const { data, error } = await supabase
        .from('complaint_notes')
        .select('*')
        .eq('complaint_id', complaintId)
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST116') throw error;

      return { success: true, timeline: data || [] };
    } catch (error) {
      logger.error('Get complaint timeline error:', error);
      return { success: false, error: 'Failed to fetch timeline' };
    }
  },

  /**
   * Add complaint note/comment
   */
  addComplaintNote: async (complaintId, userId, userType, content) => {
    try {
      const { data, error } = await supabase
        .from('complaint_notes')
        .insert({
          complaint_id: complaintId,
          user_id: userId,
          user_type: userType,
          content,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      logger.info(`Note added to complaint ${complaintId}`);
      return { success: true, note: data };
    } catch (error) {
      logger.error('Add complaint note error:', error);
      return { success: false, error: 'Failed to add note' };
    }
  },

  /**
   * Get all notes for a complaint
   */
  getComplaintNotes: async (complaintId) => {
    try {
      const { data, error } = await supabase
        .from('complaint_notes')
        .select('*')
        .eq('complaint_id', complaintId)
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST116') throw error;

      return { success: true, notes: data || [] };
    } catch (error) {
      logger.error('Get complaint notes error:', error);
      return { success: false, error: 'Failed to fetch notes' };
    }
  },

  /**
   * Get complaint categories for filtering
   */
  getCategories: async () => {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('category')
        .not('category', 'is', null)
        .distinct();

      if (error) throw error;

      const categories = data?.map(item => item.category).filter(Boolean) || [];
      return { success: true, categories: [...new Set(categories)] };
    } catch (error) {
      logger.error('Get categories error:', error);
      return { success: false, categories: [] };
    }
  }
};
