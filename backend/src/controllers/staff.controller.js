import { staffService } from '../services/staff.service.js';
import { logger } from '../utils/logger.js';

/**
 * Staff Controller
 * Handles HTTP requests for staff operations
 */

export const staffController = {
  /**
   * Get all complaints assigned to staff
   * GET /staff/complaints
   */
  getAssignedComplaints: async (req, res) => {
    try {
      const { id: staffId } = req.user;
      const { priority, status } = req.query;

      const result = await staffService.getAssignedComplaints(staffId, null, {
        priority,
        status
      });

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
   * Get complaint details with notes and field visits
   * GET /staff/complaints/:complaintId
   */
  getComplaintDetails: async (req, res) => {
    try {
      const { id: staffId } = req.user;
      const { complaintId } = req.params;

      logger.info(`Controller: getComplaintDetails - staffId=${staffId}, complaintId=${complaintId}`);

      if (!complaintId) {
        return res.status(400).json({ error: 'Complaint ID required' });
      }

      if (!staffId) {
        logger.error('Staff ID not found in token');
        return res.status(401).json({ error: 'Staff ID not found in token' });
      }

      const result = await staffService.getComplaintDetails(complaintId, staffId);

      if (!result.success) {
        logger.error(`Service error: ${result.error}`);
        return res.status(400).json({
          success: false,
          error: result.error,
          details: 'Failed to fetch complaint details'
        });
      }

      return res.json(result);
    } catch (error) {
      logger.error(`Controller exception: ${error.message}`);
      return res.status(500).json({ error: 'Failed to get complaint details' });
    }
  },

  /**
   * Update complaint status
   * PUT /staff/complaints/:complaintId/status
   * Body: { status: 'in_progress' | 'resolved' | 'pending_review' }
   */
  updateComplaintStatus: async (req, res) => {
    try {
      const { id: staffId } = req.user;
      const { complaintId } = req.params;
      const { status } = req.body;

      if (!complaintId || !status) {
        return res.status(400).json({ error: 'Complaint ID and status required' });
      }

      const validStatuses = ['assigned', 'in_progress', 'resolved', 'pending_review'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const result = await staffService.updateComplaintStatus(complaintId, status, staffId);

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.json(result);
    } catch (error) {
      logger.error('Update status error:', error);
      return res.status(500).json({ error: 'Failed to update status' });
    }
  },

  /**
   * Update complaint progress
   * PUT /staff/complaints/:complaintId/progress
   * Body: { progressPercentage: 0-100 }
   */
  updateProgress: async (req, res) => {
    try {
      const { complaintId } = req.params;
      const { progressPercentage } = req.body;

      if (!complaintId || progressPercentage === undefined) {
        return res.status(400).json({ error: 'Complaint ID and progress required' });
      }

      if (progressPercentage < 0 || progressPercentage > 100) {
        return res.status(400).json({ error: 'Progress must be between 0 and 100' });
      }

      const result = await staffService.updateComplaintProgress(complaintId, progressPercentage);

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.json(result);
    } catch (error) {
      logger.error('Update progress error:', error);
      return res.status(500).json({ error: 'Failed to update progress' });
    }
  },

  /**
   * Add note to complaint
   * POST /staff/complaints/:complaintId/notes
   * Body: { noteText: string }
   */
  addNote: async (req, res) => {
    try {
      const { complaintId } = req.params;
      const { noteText } = req.body;
      const { id: staffId, staff_name } = req.user;

      if (!complaintId || !noteText) {
        return res.status(400).json({ error: 'Complaint ID and note text required' });
      }

      const result = await staffService.addComplaintNote(complaintId, noteText, staff_name, staffId);

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      logger.error('Add note error:', error);
      return res.status(500).json({ error: 'Failed to add note' });
    }
  },

  /**
   * Schedule field visit
   * POST /staff/field-visits
   * Body: { complaintId, visitDate, visitTime, location, visitType }
   */
  scheduleFieldVisit: async (req, res) => {
    try {
      const { complaintId, visitDate, visitTime, location, visitType } = req.body;

      if (!complaintId || !visitDate || !visitTime || !location || !visitType) {
        return res.status(400).json({ error: 'All field visit details required' });
      }

      const validTypes = ['initial_inspection', 'follow_up', 'final_inspection', 'investigation'];
      if (!validTypes.includes(visitType)) {
        return res.status(400).json({ error: 'Invalid visit type' });
      }

      const result = await staffService.scheduleFieldVisit(
        complaintId,
        visitDate,
        visitTime,
        location,
        visitType
      );

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      logger.error('Schedule field visit error:', error);
      return res.status(500).json({ error: 'Failed to schedule field visit' });
    }
  },

  /**
   * Complete field visit
   * PUT /staff/field-visits/:visitId
   * Body: { findings: string }
   */
  completeFieldVisit: async (req, res) => {
    try {
      const { visitId } = req.params;
      const { findings } = req.body;

      if (!visitId || !findings) {
        return res.status(400).json({ error: 'Visit ID and findings required' });
      }

      const result = await staffService.completeFieldVisit(visitId, findings);

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.json(result);
    } catch (error) {
      logger.error('Complete field visit error:', error);
      return res.status(500).json({ error: 'Failed to complete field visit' });
    }
  },

  /**
   * Get staff dashboard summary
   * GET /staff/dashboard
   */
  getDashboard: async (req, res) => {
    try {
      const { id: staffId } = req.user;

      const result = await staffService.getStaffDashboard(staffId);

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
   * Upload evidence file for complaint work progress
   * POST /staff/complaints/:complaintId/upload-evidence
   * FormData: { file, fileType? }
   */
  uploadEvidenceFile: async (req, res) => {
    try {
      const { complaintId } = req.params;
      const { id: staffId } = req.user;
      const { fileType = 'evidence' } = req.body;

      logger.info(`uploadEvidenceFile called: complaintId=${complaintId}, staffId=${staffId}, fileType=${fileType}`);

      if (!complaintId) {
        logger.warn('uploadEvidenceFile: Missing complaint ID');
        return res.status(400).json({ error: 'Complaint ID required' });
      }

      if (!req.file) {
        logger.warn(`uploadEvidenceFile: No file provided for complaint ${complaintId}`);
        return res.status(400).json({ error: 'No file provided' });
      }

      logger.info(`uploadEvidenceFile: File received - name=${req.file.originalname}, size=${req.file.size}, type=${req.file.mimetype}`);

      const result = await staffService.uploadEvidenceFile(
        complaintId,
        req.file.buffer,
        req.file.originalname,
        fileType,
        staffId
      );

      if (!result.success) {
        logger.error(`uploadEvidenceFile failed for complaint ${complaintId}:`, result.error);
        return res.status(500).json(result);
      }

      logger.info(`uploadEvidenceFile success for complaint ${complaintId}`);
      return res.status(201).json(result);
    } catch (error) {
      logger.error('Upload evidence error:', error);
      return res.status(500).json({ error: 'Failed to upload evidence', details: error.message });
    }
  }
};
