<<<<<<< HEAD
import { Router } from 'express';
import {
  applyForJob,
  getUserApplications,
  updateApplicationStatus
} from '../controllers/application.controller';
import { authenticateJWT, requireRoles } from '../middlewares/auth.middleware';
import { validateDto } from '../middlewares/validation.middleware';
import { ApplyJobDto, UpdateApplicationStatusDto } from '../dtos/application.dto';

const router = Router();

// Learner only: apply and view applications
router.post('/apply', authenticateJWT, requireRoles(['LEARNER']), validateDto(ApplyJobDto), applyForJob);
router.get('/my-applications', authenticateJWT, requireRoles(['LEARNER']), getUserApplications);

// Employer or Admin only: update applicant pipeline stage
router.put('/status', authenticateJWT, requireRoles(['EMPLOYER', 'ADMIN']), validateDto(UpdateApplicationStatusDto), updateApplicationStatus);

export default router;
=======
>>>>>>> main
