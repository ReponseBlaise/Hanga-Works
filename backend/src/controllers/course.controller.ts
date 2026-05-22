import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { NotificationService } from '../services/notification.service';

// 1. Get all courses
export const getCourses = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        _count: {
          select: { enrollments: true, modules: true }
        }
      }
    });

    return res.json({
      status: 'success',
      data: { courses }
    });
  } catch (error: any) {
    console.error('Get Courses Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve courses',
      error: error.message
    });
  }
};

// 2. Get single course detail with modules
export const getCourseById = async (req: AuthenticatedRequest, res: Response) => {
  const { id: courseId } = req.params;

  if (!courseId) {
    return res.status(400).json({
      status: 'error',
      message: 'Course ID is required'
    });
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found'
      });
    }

    // Check if user is enrolled
    let enrollment = null;
    if (req.user) {
      enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: req.user.id,
            courseId: courseId
          }
        }
      });
    }

    return res.json({
      status: 'success',
      data: {
        course,
        enrollment
      }
    });
  } catch (error: any) {
    console.error('Get Course Detail Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve course details',
      error: error.message
    });
  }
};

// 3. Create a course (Admin or Institution only)
export const createCourse = async (req: AuthenticatedRequest, res: Response) => {
  const { title, description } = req.body;

  try {
    if (!title || !description) {
      return res.status(400).json({
        status: 'error',
        message: 'Title and description are required'
      });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        published: true
      }
    });

    return res.status(201).json({
      status: 'success',
      data: { course }
    });
  } catch (error: any) {
    console.error('Create Course Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create course',
      error: error.message
    });
  }
};

// 4. Enroll in a course (Learner only)
export const enrollInCourse = async (req: AuthenticatedRequest, res: Response) => {
  const { courseId } = req.body;

  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    if (!courseId) {
      return res.status(400).json({
        status: 'error',
        message: 'Valid Course ID is required'
      });
    }

    // Check if course exists
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ status: 'error', message: 'Course not found' });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: req.user.id,
          courseId: courseId
        }
      }
    });

    if (existingEnrollment) {
      return res.status(400).json({
        status: 'error',
        message: 'You are already enrolled in this course'
      });
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: req.user.id,
        courseId: courseId
      }
    });

    return res.status(201).json({
      status: 'success',
      message: 'Enrolled successfully',
      data: { enrollment }
    });
  } catch (error: any) {
    console.error('Enroll Course Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to enroll in course',
      error: error.message
    });
  }
};

// 5. Update progress and recalculate completion
export const updateLessonProgress = async (req: AuthenticatedRequest, res: Response) => {
  const { enrollmentId, progress, completed } = req.body;

  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    if (!enrollmentId) {
      return res.status(400).json({
        status: 'error',
        message: 'Enrollment ID is required'
      });
    }

    if (!enrollmentId) {
      return res.status(400).json({
        status: 'error',
        message: 'Valid Enrollment ID is required'
      });
    }

    // Verify enrollment belongs to user
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: true
      }
    });

    if (!enrollment || enrollment.userId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied to this enrollment record'
      });
    }

    // Determine new progress percent
    let progressPercent = enrollment.progress;
    if (progress !== undefined) {
      progressPercent = Math.min(100, Math.max(0, Number(progress)));
    } else if (completed !== undefined) {
      progressPercent = completed ? 100 : Math.max(0, enrollment.progress - 10);
    } else {
      progressPercent = Math.min(100, enrollment.progress + 20);
    }

    const isCompletedNow = progressPercent >= 100;

    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        progress: Math.round(progressPercent),
        status: isCompletedNow ? 'COMPLETED' : 'ENROLLED',
        completedAt: isCompletedNow ? new Date() : null
      }
    });

    // Auto-generate certificate if complete
    let certificate = null;
    if (isCompletedNow) {
      const existingCert = await prisma.certification.findFirst({
        where: { userId: req.user.id, courseId: enrollment.courseId }
      });

      if (!existingCert) {
        const verifyToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        certificate = await prisma.certification.create({
          data: {
            userId: req.user.id,
            courseId: enrollment.courseId,
            code: verifyToken
          }
        });

        // Add Notification to DB (make sure payload is stringified for Prisma)
        await prisma.notification.create({
          data: {
            userId: req.user.id,
            type: 'CERTIFICATE_ISSUED',
            payload: JSON.stringify({
              title: 'Course Completed! 🎓',
              message: `Congratulations! You have completed "${enrollment.course.title}" and earned a digital certificate.`
            })
          }
        });

        // Fire dual-channel real-time notifications (Email + Socket.IO)
        // We need the user's email for SendGrid
        const userWithEmail = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (userWithEmail) {
          const uInfo = { id: userWithEmail.id, email: userWithEmail.email };
          
          NotificationService.sendCourseCompletion(uInfo, enrollment.course.title)
            .catch(err => console.error('Failed to send course notification:', err));
            
          NotificationService.sendCertificateIssued(uInfo, `${enrollment.course.title} Certificate`, `http://localhost:5001/api/v1/certificates/${certificate.code}`)
            .catch(err => console.error('Failed to send cert notification:', err));
        }

      } else {
        certificate = existingCert;
      }
    }

    return res.json({
      status: 'success',
      data: {
        progress: progressPercent,
        completed: isCompletedNow,
        enrollment: updatedEnrollment,
        certificate
      }
    });
  } catch (error: any) {
    console.error('Update Progress Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update progress',
      error: error.message
    });
  }
};
