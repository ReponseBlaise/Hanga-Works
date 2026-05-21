import { Router } from 'express';
import { getPlatformStats } from '../controllers/analytics.controller';
import { authenticateJWT, requireRoles } from '../middlewares/auth.middleware';

const router = Router();

// Admin only access
router.get('/platform-stats', authenticateJWT, requireRoles(['ADMIN']), getPlatformStats);

export default router;
