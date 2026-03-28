import express from 'express';
import { searchController } from '../controllers/search.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

/**
 * Search and Filter Routes
 */
router.get('/complaints', searchController.searchComplaints);
router.get('/categories', searchController.getCategories);

/**
 * Complaint Notes/Timeline Routes
 */
router.get('/complaints/:id/timeline', searchController.getComplaintTimeline);
router.get('/complaints/:id/notes', searchController.getComplaintNotes);
router.post('/complaints/:id/notes', searchController.addComplaintNote);

export default router;
