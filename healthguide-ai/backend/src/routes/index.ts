import { Router } from 'express';
import { signup, login, me } from '../controllers/auth.controller';
import {
  createCheck,
  getChecks,
  getCheck,
  deleteCheck,
  getStats,
  getNearbyCare,
} from '../controllers/symptom.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
router.post('/auth/signup', signup);
router.post('/auth/login', login);
router.get('/auth/me', authMiddleware as never, me as never);

// Symptom routes (all protected)
router.post('/symptoms', authMiddleware as never, createCheck as never);
router.get('/symptoms', authMiddleware as never, getChecks as never);
router.get('/symptoms/stats', authMiddleware as never, getStats as never);
router.get('/symptoms/nearby-care', authMiddleware as never, getNearbyCare as never);
router.get('/symptoms/:id', authMiddleware as never, getCheck as never);
router.delete('/symptoms/:id', authMiddleware as never, deleteCheck as never);

export default router;
