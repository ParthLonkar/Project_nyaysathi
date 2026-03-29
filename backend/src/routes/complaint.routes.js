import express from 'express';
import { complaintController } from '../controllers/complaint.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { uploadComplaintAttachments } from '../middleware/complaint-upload.middleware.js';

const router = express.Router();

router.post('/', uploadComplaintAttachments, complaintController.createComplaint);
router.get('/track/:referenceId', complaintController.trackComplaintByReference);
router.get('/my', authenticate, complaintController.getUserComplaints);
router.get('/', authenticate, complaintController.getAllComplaints);
router.get('/public/solved-map', complaintController.getPublicSolvedMapData);
router.get('/:id', authenticate, complaintController.getComplaintById);
router.patch('/:id/status', authenticate, complaintController.updateComplaintStatus);
router.delete('/:id', complaintController.deleteComplaint);

export default router;

