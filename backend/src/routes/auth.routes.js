import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * Authentication Routes
 * Public routes for login and token verification
 */

// Admin login
router.post('/admin/login', authController.adminLogin);

// Staff login
router.post('/staff/login', authController.staffLogin);

// Logout
router.post('/logout', authController.logout);

// Verify token (protected)
router.get('/verify-token', verifyToken, authController.verifyToken);

// Refresh token
router.post('/refresh-token', authController.refreshToken);

export default router;
