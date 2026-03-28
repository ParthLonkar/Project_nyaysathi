import { searchService } from '../services/search.service.js';
import { logger } from '../utils/logger.js';

export const searchController = {
  /**
   * GET /search/complaints
   * Search and filter complaints
   */
  searchComplaints: async (req, res) => {
    try {
      const { id: userId, type: userType, department_id } = req.user;
      const {
        title,
        status,
        priority,
        category,
        location,
        startDate,
        endDate,
        sortBy,
        sortOrder,
        page = 1,
        limit = 20
      } = req.query;

      const userTypeStr = userType === 'department_admin' ? 'admin' : 'staff';

      const result = await searchService.searchComplaints(
        {
          title,
          status,
          priority,
          category,
          location,
          startDate,
          endDate,
          sortBy,
          sortOrder,
          page: parseInt(page),
          limit: parseInt(limit),
          departmentId: department_id
        },
        userId,
        userTypeStr
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      logger.error('Search complaints error:', error);
      return res.status(500).json({ error: 'Failed to search complaints' });
    }
  },

  /**
   * GET /search/complaints/:id/timeline
   * Get complaint timeline
   */
  getComplaintTimeline: async (req, res) => {
    try {
      const { id } = req.params;

      const result = await searchService.getComplaintTimeline(id);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      logger.error('Get timeline error:', error);
      return res.status(500).json({ error: 'Failed to fetch timeline' });
    }
  },

  /**
   * POST /search/complaints/:id/notes
   * Add note to complaint
   */
  addComplaintNote: async (req, res) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const { id: userId, type: userType } = req.user;

      if (!content) {
        return res.status(400).json({ error: 'Note content is required' });
      }

      const userTypeStr = userType === 'department_admin' ? 'admin' : 'staff';

      const result = await searchService.addComplaintNote(id, userId, userTypeStr, content);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      logger.error('Add note error:', error);
      return res.status(500).json({ error: 'Failed to add note' });
    }
  },

  /**
   * GET /search/complaints/:id/notes
   * Get all notes for a complaint
   */
  getComplaintNotes: async (req, res) => {
    try {
      const { id } = req.params;

      const result = await searchService.getComplaintNotes(id);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      logger.error('Get notes error:', error);
      return res.status(500).json({ error: 'Failed to fetch notes' });
    }
  },

  /**
   * GET /search/categories
   * Get complaint categories
   */
  getCategories: async (req, res) => {
    try {
      const result = await searchService.getCategories();

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      logger.error('Get categories error:', error);
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }
  }
};
