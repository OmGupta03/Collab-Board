import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { runShapeSnap, analyzeBoard } from '../controllers/aiController.js';

const router = express.Router();

router.post('/shapesnap', protect, runShapeSnap);
router.post('/analyze', protect, analyzeBoard);

export default router;
