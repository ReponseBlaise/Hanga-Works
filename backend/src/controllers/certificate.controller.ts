import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

// 1. Get certificates of the logged-in user
export const getUserCertificates = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const certificates = await prisma.certification.findMany({
      where: { userId: req.user.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true
          }
        }
      },
      orderBy: { issuedAt: 'desc' }
    });

    // Map code back to verifyToken for API compatibility
    const mappedCertificates = certificates.map(cert => ({
      id: cert.id,
      userId: cert.userId,
      courseId: cert.courseId,
      issuedAt: cert.issuedAt,
      expiresAt: cert.expiresAt,
      verifyToken: cert.code,
      course: (cert as any).course
    }));

    return res.json({
      status: 'success',
      data: { certificates: mappedCertificates }
    });
  } catch (error: any) {
    console.error('Get Certificates Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve certificates',
      error: error.message
    });
  }
};

// 2. Verify certificate publicly via verification token
export const verifyCertificate = async (req: Request, res: Response) => {
  const { token } = req.params;

  try {
    if (!token) {
      return res.status(400).json({
        status: 'error',
        message: 'Verification token is required'
      });
    }

    const certificate = await prisma.certification.findUnique({
      where: { code: token },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        course: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    if (!certificate) {
      return res.status(404).json({
        status: 'error',
        message: 'Invalid certificate. This credential could not be verified.'
      });
    }

    return res.json({
      status: 'success',
      message: 'Credential verified successfully',
      data: {
        certificate: {
          id: certificate.id,
          issuedTo: certificate.user?.name || 'Unknown',
          courseCompleted: certificate.course?.title || 'Unknown',
          issuedAt: certificate.issuedAt,
          verifyToken: certificate.code
        }
      }
    });
  } catch (error: any) {
    console.error('Verify Certificate Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Certificate verification failed',
      error: error.message
    });
  }
};
