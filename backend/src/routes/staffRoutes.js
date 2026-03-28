import express from 'express';
import { staffController } from '../controllers/staffController.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { verifyAdminRole } from '../middleware/admin.middleware.js';

const router = express.Router();

router.post('/add', verifyToken, verifyAdminRole, staffController.addStaff);
router.get('/', verifyToken, verifyAdminRole, staffController.listStaff);

export default router;
