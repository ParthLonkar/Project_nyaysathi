import express from 'express';
import { staffController } from '../controllers/staff.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { verifyStaffRole } from '../middleware/staff.middleware.js';

const router = express.Router();

/**
 * Staff Routes (Protected)
 * All routes require staff authentication
 */

// Get assigned complaints
router.get('/complaints', verifyToken, verifyStaffRole, staffController.getAssignedComplaints);

// Get complaint details
router.get('/complaints/:complaintId', verifyToken, verifyStaffRole, staffController.getComplaintDetails);

// Update complaint status
router.put('/complaints/:complaintId/status', verifyToken, verifyStaffRole, staffController.updateComplaintStatus);

// Update complaint progress
router.put('/complaints/:complaintId/progress', verifyToken, verifyStaffRole, staffController.updateProgress);

// Add note to complaint
router.post('/complaints/:complaintId/notes', verifyToken, verifyStaffRole, staffController.addNote);

// Schedule field visit
router.post('/field-visits', verifyToken, verifyStaffRole, staffController.scheduleFieldVisit);

// Complete field visit
router.put('/field-visits/:visitId', verifyToken, verifyStaffRole, staffController.completeFieldVisit);

// Get dashboard
router.get('/dashboard', verifyToken, verifyStaffRole, staffController.getDashboard);

export default router;
