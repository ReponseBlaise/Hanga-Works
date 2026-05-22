import { Router } from 'express';
import { getApplicantsForJob, getDashboardStats, updateApplicationStage } from '../controllers/employer.controller';
import { createJob } from '../controllers/job.controller';
import { authenticateJWT, requireRoles } from '../middlewares/auth.middleware';

const router = Router();

// Protect all routes with EMPLOYER role
router.use(authenticateJWT, requireRoles(['EMPLOYER']));

// 1. POST /employer/jobs — create job posting
router.post('/jobs', createJob);

// 2. GET /employer/jobs/:id/applicants — view applicants
router.get('/jobs/:id/applicants', getApplicantsForJob);

// 3. PATCH /employer/applications/:id/stage — move candidate
router.patch('/applications/:id/stage', updateApplicationStage);

// 4. GET /employer/analytics — application volume stats
router.get('/analytics', getDashboardStats);

export default router;
