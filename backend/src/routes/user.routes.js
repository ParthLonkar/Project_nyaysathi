import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { verifyAdminRole } from '../middleware/admin.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

/**
 * User Profile Routes
 */
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.post('/change-password', userController.changePassword);

/**
 * Performance & Stats Routes
 */
router.get('/performance', userController.getPerformanceStats);
router.get('/activity-log', userController.getActivityLog);

/**
 * Admin-only Routes
 */
router.get('/department-analytics', verifyAdminRole, userController.getDepartmentAnalytics);

export default router;
