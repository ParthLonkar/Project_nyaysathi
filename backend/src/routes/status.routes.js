import express from 'express';
import {
  updateComplaintStatus,
  getComplaintStatus,
  getComplaintsByDepartment,
  assignComplaint,
  getSLABreaches
} from '../controllers/status.controller.js';

const router = express.Router();

// Update complaint status
router.post('/:id/status', updateComplaintStatus);

// Get complaint status and progress
router.get('/:id/status', getComplaintStatus);

// Get complaints by department
router.get('/department/:deptCode', getComplaintsByDepartment);

// Assign complaint to officer
router.post('/:id/assign', assignComplaint);

// Get SLA breaches for monitoring
router.get('/monitoring/sla-breaches', getSLABreaches);

export default router;
