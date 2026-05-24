import { Injectable } from '@nestjs/common';
import { EnrollmentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── GET /analytics/overview ───────────────────────────────────────────────
  async getOverview() {
    const now = new Date();
    const startOfDay   = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      dau,
      mau,
      totalEnrollments,
      completedEnrollments,
      activeJobs,
      totalApplications,
      totalCertifications,
    ] = await Promise.all([
      this.prisma.user.count(),

      // DAU — users who had enrollment or application activity today
      this.prisma.user.count({
        where: {
          OR: [
            { enrollments:   { some: { updatedAt: { gte: startOfDay } } } },
            { applications:  { some: { updatedAt: { gte: startOfDay } } } },
          ],
        },
      }),

      // MAU — users active this month
      this.prisma.user.count({
        where: {
          OR: [
            { enrollments:  { some: { updatedAt: { gte: startOfMonth } } } },
            { applications: { some: { updatedAt: { gte: startOfMonth } } } },
          ],
        },
      }),

      this.prisma.enrollment.count(),
      this.prisma.enrollment.count({ where: { status: EnrollmentStatus.COMPLETED } }),
      this.prisma.job.count({ where: { isActive: true } }),
      this.prisma.application.count(),
      this.prisma.certification.count(),
    ]);

    const completionRate =
      totalEnrollments > 0
        ? Math.round((completedEnrollments / totalEnrollments) * 100)
        : 0;

    return {
      dau,
      mau,
      totalUsers,
      totalEnrollments,
      completedEnrollments,
      completionRate: `${completionRate}%`,
      activeJobs,
      totalApplications,
      totalCertifications,
    };
  }

  // ── GET /analytics/export?format=csv ──────────────────────────────────────
  async exportCsv() {
    const enrollments = await this.prisma.enrollment.findMany({
      select: {
        id: true,
        progress: true,
        status: true,
        startedAt: true,
        completedAt: true,
        user:   { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: { startedAt: 'desc' },
    });

    const headers = [
      'enrollmentId',
      'userId',
      'userName',
      'userEmail',
      'courseId',
      'courseTitle',
      'progress',
      'status',
      'startedAt',
      'completedAt',
    ].join(',');

    const rows = enrollments.map((e) =>
      [
        e.id,
        e.user.id,
        `"${e.user.name}"`,
        e.user.email,
        e.course.id,
        `"${e.course.title}"`,
        e.progress,
        e.status,
        e.startedAt.toISOString(),
        e.completedAt ? e.completedAt.toISOString() : '',
      ].join(','),
    );

    return [headers, ...rows].join('\n');
  }
}
