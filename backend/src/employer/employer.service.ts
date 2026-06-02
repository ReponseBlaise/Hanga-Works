import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from '../jobs/dto/create-job.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class EmployerService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService
  ) {}

  private async ensureEmployerOrg(userId: string, userName: string) {
    let user = await this.prisma.user.findUnique({ where: { id: userId }, include: { organization: true } });
    if (!user?.organizationId) {
      const org = await this.prisma.organization.create({
        data: { name: `${userName}'s Company`, type: 'EMPLOYER' }
      });
      user = await this.prisma.user.update({
        where: { id: userId },
        data: { organizationId: org.id },
        include: { organization: true }
      });
    }
    return user.organizationId!;
  }

  async createJob(userId: string, userName: string, dto: CreateJobDto) {
    const orgId = await this.ensureEmployerOrg(userId, userName);
    const slug = dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    
    return this.prisma.job.create({
      data: {
        ...dto,
        slug,
        employerId: orgId
      }
    });
  }

  async getApplicants(userId: string, jobId: string) {
    const job = await this.prisma.job.findFirst({
      where: { id: jobId, employer: { users: { some: { id: userId } } } }
    });
    if (!job) throw new NotFoundException('Job not found or unauthorized');

    return this.prisma.application.findMany({
      where: { jobId },
      include: { 
        user: { 
          select: { 
            id: true, 
            name: true, 
            email: true, 
            phone: true,
            bio: true,
            location: true,
            avatarUrl: true,
            skills: { include: { skill: true } }
          } 
        } 
      },
      orderBy: { appliedAt: 'desc' }
    });
  }

  async updateStage(userId: string, applicationId: string, dto: UpdateStageDto) {
    const app = await this.prisma.application.findFirst({
      where: { id: applicationId, job: { employer: { users: { some: { id: userId } } } } },
      include: { user: true, job: true }
    });
    
    if (!app) throw new NotFoundException('Application not found or unauthorized');

    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: { status: dto.status }
    });

    // Notify the applicant using the notification service we built earlier
    await this.notifications.sendApplicationStatusUpdate(app.user.email, dto.status, app.job.title);

    return updated;
  }

  async getAnalytics(userId: string) {
    const jobs = await this.prisma.job.findMany({
      where: { employer: { users: { some: { id: userId } } } },
      select: { id: true }
    });
    const jobIds = jobs.map(j => j.id);

    const totalJobs = jobIds.length;
    const totalApplicants = await this.prisma.application.count({ where: { jobId: { in: jobIds } } });
    
    const statusCounts = await this.prisma.application.groupBy({
      by: ['status'],
      where: { jobId: { in: jobIds } },
      _count: { status: true }
    });

    const breakdown = statusCounts.reduce((acc, curr) => {
      acc[curr.status] = curr._count.status;
      return acc;
    }, {} as Record<string, number>);

    return { totalJobs, totalApplicants, breakdown };
  }
}