import express from 'express';
import { legalResearchController } from '../controllers/legalResearchController.js';

const router = express.Router();

router.get('/', legalResearchController.search);

export default router;
