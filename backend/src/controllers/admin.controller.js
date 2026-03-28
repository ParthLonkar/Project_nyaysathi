import { adminService } from '../services/admin.service.js';
import { logger } from '../utils/logger.js';

/**
 * Admin Controller
 * Handles HTTP requests for admin operations
 */

export const adminController = {
  /**
   * Get all complaints for admin's department
   * GET /admin/complaints
   */
  getComplaints: async (req, res) => {
    try {
      const { id: adminId, department_id } = req.user;
      const { status, priority } = req.query;

      if (!department_id) {
        return res.status(400).json({ error: 'Department ID required' });
      }

      const result = await adminService.getDepartmentComplaints(department_id, { status, priority, departmentCode: req.user.department_code });

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.json(result);
    } catch (error) {
      logger.error('Get complaints error:', error);
      return res.status(500).json({ error: 'Failed to get complaints' });
    }
  },

  /**
   * Get all staff in admin's department
   * GET /admin/staff
   */
  getStaff: async (req, res) => {
    try {
      const { department_id } = req.user;

      if (!department_id) {
        return res.status(400).json({ error: 'Department ID required' });
      }

      const result = await adminService.getDepartmentStaff(department_id);

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.json(result);
    } catch (error) {
      logger.error('Get staff error:', error);
      return res.status(500).json({ error: 'Failed to get staff' });
    }
  },

  /**
   * Assign complaint to staff member
   * POST /admin/assign-complaint
   * Body: { complaintId, staffId, notes? }
   */
  assignComplaint: async (req, res) => {
    try {
      const { id: adminId, department_id } = req.user;
      const { complaintId, staffId, notes } = req.body;

      if (!complaintId || !staffId) {
        return res.status(400).json({ error: 'Complaint ID and Staff ID required' });
      }

      const result = await adminService.assignComplaintToStaff(
        complaintId,
        staffId,
        adminId,
        department_id,
        notes
      );

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.json(result);
    } catch (error) {
      logger.error('Assign complaint error:', error);
      return res.status(500).json({ error: 'Failed to assign complaint' });
    }
  },

  /**
   * Create new staff member
   * POST /admin/staff
   * Body: { username, password, staff_name, email, phone, position }
   */
  createStaff: async (req, res) => {
    try {
      const { id: adminId, department_id } = req.user;
      const { username, password, staff_name, email, phone, position } = req.body;

      if (!username || !password || !staff_name || !email || !position) {
        return res.status(400).json({ error: 'Required fields: username, password, staff_name, email, position' });
      }

      const result = await adminService.createStaff(
        {
          username,
          password,
          staff_name,
          email,
          phone: phone || null,
          position
        },
        department_id,
        adminId
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      logger.error('Create staff error:', error);
      return res.status(500).json({ error: 'Failed to create staff' });
    }
  },

  /**
   * Deactivate staff member
   * PUT /admin/staff/:staffId/deactivate
   */
  deactivateStaff: async (req, res) => {
    try {
      const { staffId } = req.params;

      if (!staffId) {
        return res.status(400).json({ error: 'Staff ID required' });
      }

      const result = await adminService.deactivateStaff(staffId);

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.json(result);
    } catch (error) {
      logger.error('Deactivate staff error:', error);
      return res.status(500).json({ error: 'Failed to deactivate staff' });
    }
  },

  /**
   * Get department analytics
   * GET /admin/analytics
   */
  getAnalytics: async (req, res) => {
    try {
      const { department_id } = req.user;

      if (!department_id) {
        return res.status(400).json({ error: 'Department ID required' });
      }

      const result = await adminService.getDepartmentAnalytics(department_id);

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.json(result);
    } catch (error) {
      logger.error('Get analytics error:', error);
      return res.status(500).json({ error: 'Failed to get analytics' });
    }
  },

  /**
   * Get dashboard summary
   * GET /admin/dashboard
   */
  getDashboard: async (req, res) => {
    try {
      const { department_id } = req.user;

      if (!department_id) {
        return res.status(400).json({ error: 'Department ID required' });
      }

      const result = await adminService.getDashboardSummary(department_id);

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.json(result);
    } catch (error) {
      logger.error('Get dashboard error:', error);
      return res.status(500).json({ error: 'Failed to get dashboard' });
    }
  },

  /**
   * Get staff performance
   * GET /admin/staff/:staffId/performance
   */
  getStaffPerformance: async (req, res) => {
    try {
      const { staffId } = req.params;

      if (!staffId) {
        return res.status(400).json({ error: 'Staff ID required' });
      }

      const result = await adminService.getStaffPerformance(staffId);

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.json(result);
    } catch (error) {
      logger.error('Get staff performance error:', error);
      return res.status(500).json({ error: 'Failed to get staff performance' });
    }
  }
};

