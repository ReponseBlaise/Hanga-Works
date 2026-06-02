import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateUserStatus(id: string, status: AccountStatus) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, status: true },
    });
  }

  async getJobs() {
    return this.prisma.job.findMany({
      select: {
        id: true,
        title: true,
        employer: { select: { name: true } },
        isActive: true,
        postedAt: true,
      },
      orderBy: { postedAt: 'desc' },
    });
  }

  async updateJobStatus(id: string, isActive: boolean) {
    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job) throw new NotFoundException('Job not found');
    return this.prisma.job.update({
      where: { id },
      data: { isActive },
      select: { id: true, isActive: true },
    });
  }

  async getCourses() {
    return this.prisma.course.findMany({
      select: {
        id: true,
        title: true,
        institution: { select: { name: true } },
        published: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateCourseStatus(id: string, published: boolean) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');
    return this.prisma.course.update({
      where: { id },
      data: { published },
      select: { id: true, published: true },
    });
  }
}
