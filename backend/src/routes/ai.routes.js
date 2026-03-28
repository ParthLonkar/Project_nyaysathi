const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/process', authenticate, aiController.processComplaint);
router.get('/status/:complaintId', authenticate, aiController.getProcessingStatus);
router.post('/escalate', authenticate, aiController.escalateComplaint);

module.exports = router;
