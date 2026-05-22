import { Router } from 'express';
import { getApplicants, getDashboardStats } from '../controllers/employer.controller';
import { authenticateJWT, requireRoles } from '../middlewares/auth.middleware';

const router = Router();

// Employer and Admin access only
router.get('/applicants', authenticateJWT, requireRoles(['EMPLOYER', 'ADMIN']), getApplicants);
router.get('/stats', authenticateJWT, requireRoles(['EMPLOYER', 'ADMIN']), getDashboardStats);

export default router;
