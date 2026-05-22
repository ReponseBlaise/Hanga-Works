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

// 3. Get all applicants for a SPECIFIC job
export const getApplicantsForJob = async (req: AuthenticatedRequest, res: Response) => {
  const { id: jobId } = req.params;
  try {
    if (!req.user || !req.user.organizationId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized employer' });
    }

    if (!jobId) {
      return res.status(400).json({ status: 'error', message: 'Job ID is required' });
    }

    // Verify job belongs to this employer
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.employerId !== req.user.organizationId) {
      return res.status(404).json({ status: 'error', message: 'Job not found or access denied' });
    }

    const applications = await prisma.application.findMany({
      where: { jobId },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });

    return res.json({
      status: 'success',
      data: { applications }
    });
  } catch (error: any) {
    console.error('Get Applicants For Job Error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to retrieve applicants' });
  }
};

// 4. Update application stage
import { NotificationService } from '../services/notification.service';
export const updateApplicationStage = async (req: AuthenticatedRequest, res: Response) => {
  const { id: applicationId } = req.params;
  const { stage } = req.body;

  try {
    if (!req.user || !req.user.organizationId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized employer' });
    }

    if (!applicationId || !stage) {
      return res.status(400).json({ status: 'error', message: 'Application ID and stage are required' });
    }

    const validStatuses = ['APPLIED', 'REVIEWING', 'SHORTLISTED', 'HIRED', 'REJECTED'];
    if (!validStatuses.includes(stage.toUpperCase())) {
      return res.status(400).json({ status: 'error', message: 'Invalid stage' });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true, user: true }
    });

    if (!application || application.job.employerId !== req.user.organizationId) {
      return res.status(404).json({ status: 'error', message: 'Application not found or access denied' });
    }

    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: { status: stage.toUpperCase() as any },
      include: { user: true, job: true }
    });

    // Notify Candidate
    await NotificationService.sendApplicationStatusUpdate(
      updatedApplication.user,
      updatedApplication.job.title,
      updatedApplication.status
    );

    return res.json({
      status: 'success',
      message: `Application stage updated to ${stage}`,
      data: { application: updatedApplication }
    });
  } catch (error: any) {
    console.error('Update Application Stage Error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to update application stage' });
  }
};
