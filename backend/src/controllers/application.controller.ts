import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { NotificationService } from '../services/notification.service';

// 1. Apply for a job (Learners only)
export const applyForJob = async (req: AuthenticatedRequest, res: Response) => {
  const { jobId } = req.body;

  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    if (!jobId) {
      return res.status(400).json({
        status: 'error',
        message: 'Valid Job ID is required'
      });
    }

    // Verify job listing exists
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return res.status(404).json({ status: 'error', message: 'Job not found' });
    }

    // Check if already applied (compound key userId_jobId)
    const existingApplication = await prisma.application.findUnique({
      where: {
        userId_jobId: {
          userId: req.user.id,
          jobId: jobId
        }
      }
    });

    if (existingApplication) {
      return res.status(400).json({
        status: 'error',
        message: 'You have already applied for this job'
      });
    }

    // Create Application
    const application = await prisma.application.create({
      data: {
        jobId: jobId,
        userId: req.user.id
      }
    });

    // Notify Employer (all users belonging to that organization)
    if (job.employerId) {
      const employerUsers = await prisma.user.findMany({
        where: { organizationId: job.employerId }
      });
      for (const empUser of employerUsers) {
        await prisma.notification.create({
          data: {
            userId: empUser.id,
            type: 'NEW_APPLICANT',
            payload: {
              title: 'New Applicant! 💼',
              message: `A candidate has applied for your job listing: "${job.title}".`
            }
          }
        });
      }
    }

    return res.status(201).json({
      status: 'success',
      message: 'Application submitted successfully',
      data: { application }
    });
  } catch (error: any) {
    console.error('Apply Job Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to submit application',
      error: error.message
    });
  }
};

// 2. Get applications of the logged-in user (Learners)
export const getUserApplications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const applications = await prisma.application.findMany({
      where: { userId: req.user.id },
      include: {
        job: {
          include: {
            employer: {
              select: {
                id: true,
                name: true,
                website: true
              }
            }
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
    console.error('Get User Applications Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve applications',
      error: error.message
    });
  }
};

// 3. Update application hiring stage (Employer or Admin)
export const updateApplicationStatus = async (req: AuthenticatedRequest, res: Response) => {
  const { applicationId, status } = req.body;

  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    if (!applicationId || !status) {
      return res.status(400).json({
        status: 'error',
        message: 'Valid Application ID and status are required'
      });
    }

    // Verify status string matches allowed values
    const validStatuses = ['APPLIED', 'REVIEWING', 'SHORTLISTED', 'HIRED', 'REJECTED'];
    if (!validStatuses.includes(status.toUpperCase())) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status. Must be: APPLIED, REVIEWING, SHORTLISTED, HIRED, or REJECTED'
      });
    }

    // Verify application exists and employer is the owner of the job
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
        user: true
      }
    });

    if (!application) {
      return res.status(404).json({
        status: 'error',
        message: 'Application not found'
      });
    }

    // Check if employer matches the organization of the job, or if admin
    const hasPermission = req.user.role === 'ADMIN' || 
                         (req.user.organizationId && application.job.employerId === req.user.organizationId);

    if (!hasPermission) {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden: You do not have permission to modify this application'
      });
    }

    // Update status
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: status.toUpperCase()
      },
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
      message: `Application status updated to ${status}`,
      data: { application: updatedApplication }
    });
  } catch (error: any) {
    console.error('Update Application Status Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update application status',
      error: error.message
    });
  }
};
