import express from 'express';
import { complaintController } from '../controllers/complaint.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', complaintController.createComplaint);
router.get('/my', complaintController.getUserComplaints);
router.get('/', authenticate, complaintController.getAllComplaints);
router.get('/:id', authenticate, complaintController.getComplaintById);
router.patch('/:id/status', authenticate, complaintController.updateComplaintStatus);
router.delete('/:id', complaintController.deleteComplaint);

export default router;
