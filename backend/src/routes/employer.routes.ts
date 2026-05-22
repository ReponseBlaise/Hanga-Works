import { Router } from 'express';
import { getApplicantsForJob, getDashboardStats, updateApplicationStage } from '../controllers/employer.controller';
import { createJob } from '../controllers/job.controller';
import { authenticateJWT, requireRoles } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { CreateJobSchema, UpdateApplicationStageSchema } from '../utils/validators';

const router = Router();

// Protect all routes with EMPLOYER role
router.use(authenticateJWT, requireRoles(['EMPLOYER']));

// 1. POST /employer/jobs — create job posting
router.post('/jobs', validateRequest(CreateJobSchema), createJob);

// 2. GET /employer/jobs/:id/applicants — view applicants
router.get('/jobs/:id/applicants', getApplicantsForJob);

// 3. PATCH /employer/applications/:id/stage — move candidate
router.patch('/applications/:id/stage', validateRequest(UpdateApplicationStageSchema), updateApplicationStage);

// 4. GET /employer/analytics — application volume stats
router.get('/analytics', getDashboardStats);

export default router;
