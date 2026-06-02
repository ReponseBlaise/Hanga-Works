import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { EnrollmentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CertificationsService } from '../../certifications/certifications.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

const QUIZ_PASS_SCORE = 70;

@Injectable()
export class ProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly certifications: CertificationsService,
    private readonly notifications: NotificationsService,
  ) {}

  async updateProgress(enrollmentId: string, userId: string, dto: UpdateProgressDto) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!enrollment) throw new NotFoundException(`Enrollment ${enrollmentId} not found`);
    if (enrollment.userId !== userId) throw new ForbiddenException('Access denied');

    const status: EnrollmentStatus =
      dto.progress === 100
        ? EnrollmentStatus.COMPLETED
        : dto.status ?? EnrollmentStatus.IN_PROGRESS;

    const updated = await this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        progress: dto.progress,
        status,
        completedAt: status === EnrollmentStatus.COMPLETED ? new Date() : null,
        updatedAt: new Date(),
      },
      include: {
        course: { select: { id: true, title: true } },
      },
    });

    if (status === EnrollmentStatus.COMPLETED) {
      await this.certifications.issue(userId, enrollment.courseId);

      const learner = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });
      const courseTitle = updated.course?.title ?? 'your course';

      if (learner?.email) {
        await this.notifications.sendCourseCompletion(learner.email, courseTitle);
      }

      await this.notifications.createInApp(userId, 'course-complete', {
        title: 'Course completed',
        message: `You finished ${courseTitle}.`,
        courseId: enrollment.courseId,
      });
      this.notifications.emitCourseComplete(userId, {
        courseTitle,
        courseId: enrollment.courseId,
      });
    }

    return updated;
  }

  async submitQuiz(moduleId: string, userId: string, dto: SubmitQuizDto) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: dto.enrollmentId },
      include: {
        course: { include: { modules: true } },
      },
    });

    if (!enrollment) throw new NotFoundException(`Enrollment ${dto.enrollmentId} not found`);
    if (enrollment.userId !== userId) throw new ForbiddenException('Access denied');

    const module = enrollment.course.modules.find((m) => m.id === moduleId);
    if (!module) throw new NotFoundException(`Module ${moduleId} not found in this course`);

    const passed = dto.score >= QUIZ_PASS_SCORE;

    if (!passed) {
      return {
        passed: false,
        score: dto.score,
        required: QUIZ_PASS_SCORE,
        message: `Score ${dto.score} is below the passing mark of ${QUIZ_PASS_SCORE}. Please retry.`,
        enrollment,
      };
    }

    // Recalculate overall progress: count completed modules / total modules
    const totalModules = enrollment.course.modules.length;
    const completedOrder = module.order;
    const newProgress = Math.round((completedOrder / totalModules) * 100);

    const status =
      newProgress >= 100 ? EnrollmentStatus.COMPLETED : EnrollmentStatus.IN_PROGRESS;

    const updated = await this.prisma.enrollment.update({
      where: { id: dto.enrollmentId },
      data: {
        progress: newProgress,
        status,
        completedAt: status === EnrollmentStatus.COMPLETED ? new Date() : null,
        updatedAt: new Date(),
      },
      include: { course: { select: { id: true, title: true } } },
    });

    if (status === EnrollmentStatus.COMPLETED) {
      await this.certifications.issue(enrollment.userId, enrollment.courseId);
    }

    return {
      passed: true,
      score: dto.score,
      required: QUIZ_PASS_SCORE,
      message: 'Quiz passed! Progress updated.',
      enrollment: updated,
    };
  }

  async getProgress(userId: string) {
    return this.prisma.enrollment.findMany({
      where: { userId },
      select: {
        id: true,
        progress: true,
        status: true,
        startedAt: true,
        completedAt: true,
        course: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }
}
