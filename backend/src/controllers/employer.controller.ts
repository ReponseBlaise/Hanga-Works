import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

// 1. Get all applications for jobs posted by this employer
export const getApplicants = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    if (!req.user.organizationId) {
      return res.json({
        status: 'success',
        data: { applications: [] }
      });
    }

    const applications = await prisma.application.findMany({
      where: {
        job: {
          employerId: req.user.organizationId
        }
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });

    return res.json({
      status: 'success',
      data: { applications }
    });
  } catch (error: any) {
    console.error('Get Applicants Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve applicants',
      error: error.message
    });
  }
};

// 2. Get recruiter dashboard metrics
export const getDashboardStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    if (!req.user.organizationId) {
      return res.json({
        status: 'success',
        data: {
          stats: {
            totalJobs: 0,
            totalApplications: 0,
            pendingReview: 0,
            shortlisted: 0,
            hired: 0
          }
        }
      });
    }

    const totalJobs = await prisma.job.count({
      where: { employerId: req.user.organizationId }
    });

    const totalApplications = await prisma.application.count({
      where: {
        job: {
          employerId: req.user.organizationId
        }
      }
    });

    const pendingReview = await prisma.application.count({
      where: {
        job: { employerId: req.user.organizationId },
        status: 'APPLIED'
      }
    });

    const shortlisted = await prisma.application.count({
      where: {
        job: { employerId: req.user.organizationId },
        status: 'SHORTLISTED'
      }
    });

    const hired = await prisma.application.count({
      where: {
        job: { employerId: req.user.organizationId },
        status: 'HIRED'
      }
    });

    return res.json({
      status: 'success',
      data: {
        stats: {
          totalJobs,
          totalApplications,
          pendingReview,
          shortlisted,
          hired
        }
      }
    });
  } catch (error: any) {
    console.error('Get Employer Stats Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve dashboard metrics',
      error: error.message
    });
  }
};
