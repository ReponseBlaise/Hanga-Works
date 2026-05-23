import { Router } from 'express';
import { getJobs, getJobById, createJob } from '../controllers/job.controller';
import { authenticateJWT, requireRoles } from '../middlewares/auth.middleware';
import { validateDto } from '../middlewares/validation.middleware';
import { CreateJobDto } from '../dtos/job.dto';

const router = Router();

// Public discovery
router.get('/', getJobs);
router.get('/:id', getJobById);

// Employer or Admin only to create jobs
router.post('/', authenticateJWT, requireRoles(['EMPLOYER', 'ADMIN']), validateDto(CreateJobDto), createJob);

export default router;
