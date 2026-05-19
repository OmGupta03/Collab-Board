import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { analyzeBoard } from '../controllers/aiController.js';

const router = express.Router();

router.post('/analyze', protect, analyzeBoard);

export default router;
