import express from 'express';
import { aiController } from '../controllers/ai.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/process', authenticate, aiController.processComplaint);
router.get('/status/:complaintId', authenticate, aiController.getProcessingStatus);
router.post('/escalate', authenticate, aiController.escalateComplaint);

export default router;
