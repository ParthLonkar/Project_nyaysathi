import express from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { verifyAdminRole } from '../middleware/admin.middleware.js';

const router = express.Router();

/**
 * Admin Routes (Protected)
 * All routes require admin authentication
 */

// Get all complaints for department
router.get('/complaints', verifyToken, verifyAdminRole, adminController.getComplaints);

// Get all staff in department
router.get('/staff', verifyToken, verifyAdminRole, adminController.getStaff);

// Assign complaint to staff
router.post('/assign-complaint', verifyToken, verifyAdminRole, adminController.assignComplaint);

// Create new staff
router.post('/staff', verifyToken, verifyAdminRole, adminController.createStaff);

// Create new staff (alias endpoint)
router.post('/add-staff', verifyToken, verifyAdminRole, adminController.createStaff);

// Deactivate staff member
router.put('/staff/:staffId/deactivate', verifyToken, verifyAdminRole, adminController.deactivateStaff);

// Get department analytics
router.get('/analytics', verifyToken, verifyAdminRole, adminController.getAnalytics);

// Get dashboard summary
router.get('/dashboard', verifyToken, verifyAdminRole, adminController.getDashboard);

// Get specific staff performance
router.get('/staff/:staffId/performance', verifyToken, verifyAdminRole, adminController.getStaffPerformance);

// Get daily report data
router.get('/daily-report', verifyToken, verifyAdminRole, adminController.getDailyReport);

// Download daily report as PDF
router.get('/daily-report/download/pdf', verifyToken, verifyAdminRole, adminController.downloadDailyReportPDF);

// Get RTI PDF for a complaint
router.get('/complaints/:complaintId/rti-pdf', verifyToken, verifyAdminRole, adminController.getRtiPdf);

export default router;
