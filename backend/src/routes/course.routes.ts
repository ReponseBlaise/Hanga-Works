import { Router } from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
  enrollInCourse,
  updateLessonProgress
} from '../controllers/course.controller';
import { authenticateJWT, requireRoles } from '../middlewares/auth.middleware';
import { validateDto } from '../middlewares/validation.middleware';
import { CreateCourseDto, EnrollCourseDto, UpdateProgressDto } from '../dtos/course.dto';

const router = Router();

// Public / Learner access
router.get('/', getCourses);
router.get('/:id', authenticateJWT, getCourseById);

// Learner only
router.post('/enroll', authenticateJWT, requireRoles(['LEARNER']), validateDto(EnrollCourseDto), enrollInCourse);
router.post('/progress', authenticateJWT, requireRoles(['LEARNER']), validateDto(UpdateProgressDto), updateLessonProgress);

// Admin / Instructor access to create courses
router.post('/', authenticateJWT, requireRoles(['ADMIN']), validateDto(CreateCourseDto), createCourse);

export default router;
