import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateJWT, requireRoles } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { RegisterSchema, LoginSchema } from '../utils/validators';

const router = Router();

// Public routes
router.post('/register', validateRequest(RegisterSchema), AuthController.register);
router.post('/login', validateRequest(LoginSchema), AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.get('/reset-password', AuthController.resetPasswordPage);

// Protected routes
// Using JwtAuthGuard and RolesGuard inspecting AuthController.getProfile decorator metadata
router.get(
  '/profile',
  authenticateJWT,
  requireRoles(['LEARNER', 'EMPLOYER', 'INSTITUTION', 'MENTOR', 'ADMIN']),
  AuthController.getProfile
);

export default router;
