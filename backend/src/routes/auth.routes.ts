import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateJWT, requireRoles } from '../middlewares/auth.middleware';
import { validateDto } from '../middlewares/validation.middleware';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from '../dtos/auth.dto';

const router = Router();

// Public routes
router.post('/register', validateDto(RegisterDto), AuthController.register);
router.post('/login', validateDto(LoginDto), AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);
router.post('/forgot-password', validateDto(ForgotPasswordDto), AuthController.forgotPassword);
router.post('/reset-password', validateDto(ResetPasswordDto), AuthController.resetPassword);
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
