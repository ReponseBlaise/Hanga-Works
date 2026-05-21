import { Router } from 'express';
import {
  getUserCertificates,
  verifyCertificate
} from '../controllers/certificate.controller';
import { authenticateJWT, requireRoles } from '../middlewares/auth.middleware';

const router = Router();

// Public route to verify certificate credentials (no auth required)
router.get('/verify/:token', verifyCertificate);

// Learner only: view owned certificates
router.get('/my-certificates', authenticateJWT, requireRoles(['LEARNER']), getUserCertificates);

export default router;
