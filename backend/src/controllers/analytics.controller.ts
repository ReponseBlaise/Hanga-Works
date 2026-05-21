import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

// 1. Get platform-wide metrics (Admin only)
export const getPlatformStats = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalLearners = await prisma.user.count({ where: { role: 'LEARNER' } });
    const totalEmployers = await prisma.user.count({ where: { role: 'EMPLOYER' } });
    const totalAdmins = await prisma.user.count({ where: { role: 'ADMIN' } });

    const totalJobs = await prisma.job.count();
    const totalApplications = await prisma.application.count();
    const totalCourses = await prisma.course.count();
    const totalEnrollments = await prisma.enrollment.count();
    const totalCertificates = await prisma.certification.count();

    return res.json({
      status: 'success',
      data: {
        stats: {
          users: {
            total: totalUsers,
            learners: totalLearners,
            employers: totalEmployers,
            admins: totalAdmins
          },
          jobs: {
            total: totalJobs,
            applications: totalApplications
          },
          education: {
            courses: totalCourses,
            enrollments: totalEnrollments,
            certificates: totalCertificates
          }
        }
      }
    });
  } catch (error: any) {
    console.error('Get Platform Stats Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve platform analytics',
      error: error.message
    });
  }
};
