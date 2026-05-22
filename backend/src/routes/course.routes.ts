import { Router } from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
  enrollInCourse,
  updateLessonProgress
} from '../controllers/course.controller';
import { authenticateJWT, requireRoles } from '../middlewares/auth.middleware';

const router = Router();

// Public / Learner access
router.get('/', getCourses);
router.get('/:id', authenticateJWT, getCourseById);

// Learner only
router.post('/enroll', authenticateJWT, requireRoles(['LEARNER']), enrollInCourse);
router.post('/progress', authenticateJWT, requireRoles(['LEARNER']), updateLessonProgress);

// Admin / Instructor access to create courses
router.post('/', authenticateJWT, requireRoles(['ADMIN']), createCourse);

export default router;
