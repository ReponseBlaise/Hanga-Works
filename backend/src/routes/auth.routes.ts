import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

const router = Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.get('/reset-password', AuthController.resetPasswordPage);

// Protected routes
// Using JwtAuthGuard and RolesGuard inspecting AuthController.getProfile decorator metadata
router.get(
  '/profile',
  JwtAuthGuard,
  RolesGuard(AuthController.getProfile),
  AuthController.getProfile
);

export default router;
