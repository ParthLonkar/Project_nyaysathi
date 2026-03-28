import express from 'express';
import { complianceController } from '../controllers/complianceController.js';

const router = express.Router();

router.get('/', complianceController.list);

export default router;
