const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaint.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/', complaintController.createComplaint);
router.get('/my', authenticate, complaintController.getUserComplaints);
router.get('/', authenticate, complaintController.getAllComplaints);
router.get('/:id', authenticate, complaintController.getComplaintById);
router.patch('/:id/status', authenticate, complaintController.updateComplaintStatus);
router.delete('/:id', authenticate, complaintController.deleteComplaint);

module.exports = router;
