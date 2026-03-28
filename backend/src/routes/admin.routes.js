const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get('/users', authenticate, authorize('admin'), adminController.getUsers);
router.get('/complaints/stats', authenticate, authorize('admin'), adminController.getComplaintStats);
router.patch('/users/:id/role', authenticate, authorize('admin'), adminController.updateUserRole);
router.delete('/complaints/:id', authenticate, authorize('admin'), adminController.deleteComplaint);

module.exports = router;
