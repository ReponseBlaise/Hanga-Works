const fs = require('fs');
const path = require('path');

const files = {
  'src/employer/dto/create-job.dto.ts': `import { IsString, IsNotEmpty, IsOptional, IsInt, IsEnum } from 'class-validator';
import { JobType } from '@prisma/client';

export class CreateJobDto {
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsNotEmpty() description: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsEnum(JobType) jobType?: JobType;
  @IsOptional() @IsInt() salaryMin?: number;
  @IsOptional() @IsInt() salaryMax?: number;
}`,
  'src/employer/dto/update-stage.dto.ts': `import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApplicationStatus } from '@prisma/client';

export class UpdateStageDto {
  @IsEnum(ApplicationStatus)
  @IsNotEmpty()
  status: ApplicationStatus;
}`,
  'src/employer/employer.service.ts': `import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
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
        data: { name: \`\${userName}'s Company\`, type: 'EMPLOYER' }
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
      include: { user: { select: { id: true, name: true, email: true, phone: true } } },
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
    }, {});

    return { totalJobs, totalApplicants, breakdown };
  }
}`,
  'src/employer/employer.controller.ts': `import { Controller, Post, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { EmployerService } from './employer.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('EMPLOYER')
@Controller('employer')
export class EmployerController {
  constructor(private readonly employerService: EmployerService) {}

  @Post('jobs')
  async createJob(@CurrentUser() user: any, @Body() dto: CreateJobDto) {
    return this.employerService.createJob(user.userId, user.name || 'Employer', dto);
  }

  @Get('jobs/:id/applicants')
  async getApplicants(@CurrentUser() user: any, @Param('id') jobId: string) {
    return this.employerService.getApplicants(user.userId, jobId);
  }

  @Patch('applications/:id/stage')
  async updateStage(
    @CurrentUser() user: any,
    @Param('id') applicationId: string,
    @Body() dto: UpdateStageDto
  ) {
    return this.employerService.updateStage(user.userId, applicationId, dto);
  }

  @Get('analytics')
  async getAnalytics(@CurrentUser() user: any) {
    return this.employerService.getAnalytics(user.userId);
  }
}`,
  'src/employer/employer.module.ts': `import { Module } from '@nestjs/common';
import { EmployerController } from './employer.controller';
import { EmployerService } from './employer.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [EmployerController],
  providers: [EmployerService, PrismaService],
})
export class EmployerModule {}`
};

for (const [filePath, content] of Object.entries(files)) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}
