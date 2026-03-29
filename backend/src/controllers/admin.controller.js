import { adminService } from '../services/admin.service.js';
import { pdfService } from '../services/pdf.service.js';
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
  },

  /**
   * Get daily report data
   * GET /admin/daily-report?date=YYYY-MM-DD
   */
  getDailyReport: async (req, res) => {
    try {
      const { department_id, id: adminId } = req.user;
      const { date, reportType } = req.query;

      if (!department_id) {
        return res.status(400).json({ error: 'Department ID required', success: false });
      }

      // Parse the date or use today
      let reportDate = new Date();
      if (date) {
        const [year, month, day] = date.split('-').map(Number);
        if (isNaN(year) || isNaN(month) || isNaN(day)) {
          return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD', success: false });
        }
        reportDate = new Date(year, month - 1, day);
      }

      // Check if requested report type is 3-day (default is true for 3-day)
      const isThreeDayReport = reportType !== 'daily';

      logger.info(`Admin ${adminId} requesting ${isThreeDayReport ? '3-day' : 'daily'} report for ${reportDate.toISOString()}`);

      const result = await adminService.getDailyReport(department_id, reportDate, isThreeDayReport);

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.json(result);
    } catch (error) {
      logger.error('getDailyReport controller error:', error);
      return res.status(500).json({ success: false, error: 'Failed to get daily report: ' + error.message });
    }
  },

  /**
   * Generate and download daily report PDF
   * GET /admin/daily-report/download?date=YYYY-MM-DD&reportType=3day (default) or daily
   */
  downloadDailyReportPDF: async (req, res) => {
    try {
      const { id: adminId, department_id, staff_name, department_name } = req.user;
      const { date, reportType } = req.query;

      if (!department_id) {
        return res.status(400).json({ error: 'Department ID required', success: false });
      }

      // Parse the date or use today
      let reportDate = new Date();
      if (date) {
        const [year, month, day] = date.split('-').map(Number);
        if (isNaN(year) || isNaN(month) || isNaN(day)) {
          return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD', success: false });
        }
        reportDate = new Date(year, month - 1, day);
      }

      // Check if requested report type is 3-day (default is true for 3-day)
      const isThreeDayReport = reportType !== 'daily';

      logger.info(`Admin ${adminId} requesting ${isThreeDayReport ? '3-day' : 'daily'} PDF download for ${reportDate.toISOString()}`);

      // Get report data
      const reportResult = await adminService.getDailyReport(department_id, reportDate, isThreeDayReport);

      if (!reportResult.success) {
        logger.error('Failed to fetch report data:', reportResult.error);
        return res.status(500).json(reportResult);
      }

      // Prepare data for PDF generation
      const reportData = {
        ...reportResult.report,
        preparedBy: staff_name || 'Admin User',
        department: department_name || 'Department',
      };

      try {
        // Generate PDF using local service
        logger.info('Generating PDF using backend service...');
        const pdfBuffer = await pdfService.generateDailyReportPDF(reportData);

        const reportTypeStr = isThreeDayReport ? 'ThreeDay' : 'Daily';
        const filename = `${reportTypeStr}_Report_${reportDate.toISOString().split('T')[0]}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        logger.info(`PDF generated successfully: ${filename}`);
        return res.send(pdfBuffer);
      } catch (pdfError) {
        logger.error('PDF generation error:', pdfError);
        // Fallback: return report data as JSON
        return res.json({
          success: true,
          fallback: true,
          message: 'PDF generation service temporarily unavailable. Report data provided in JSON format. You can download the PDF later or try again.',
          ...reportResult
        });
      }
    } catch (error) {
      logger.error('downloadDailyReportPDF controller error:', error);
      return res.status(500).json({ success: false, error: 'Failed to generate report PDF: ' + error.message });
    }
  },

  /**
   * Get RTI PDF for a specific complaint
   * GET /admin/complaints/:complaintId/rti-pdf
   */
  getRtiPdf: async (req, res) => {
    try {
      const { complaintId } = req.params;
      const { department_id } = req.user;

      if (!complaintId) {
        return res.status(400).json({ error: 'Complaint ID required' });
      }

      const result = await adminService.getRtiPdf(complaintId, department_id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      logger.info(`RTI PDF retrieved for complaint ${complaintId}: ${result.fileName}`);
      return res.json({
        success: true,
        fileName: result.fileName,
        pdfUrl: result.pdfUrl,
        documentId: result.documentId,
        createdAt: result.createdAt
      });
    } catch (error) {
      logger.error('Get RTI PDF error:', error);
      return res.status(500).json({ error: 'Failed to get RTI PDF' });
    }
  }
};

