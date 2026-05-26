import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FilterJobsDto } from './dto/filter-jobs.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

const jobInclude = {
  employer: { select: { id: true, name: true, website: true } },
  skills: { include: { skill: true } },
  _count: { select: { applications: true } },
};

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── POST /jobs ────────────────────────────────────────────────────────────
  async createJob(userId: string, userRole: string, dto: CreateJobDto) {
    if (userRole !== Role.EMPLOYER && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Only employers can post jobs');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    if (!user?.organizationId) {
      throw new BadRequestException('Your account is not linked to an organisation');
    }

    const { skillIds, expiresAt, ...jobFields } = dto;

    const job = await this.prisma.job.create({
      data: {
        ...jobFields,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        employerId: user.organizationId,
        skills: skillIds?.length
          ? { create: skillIds.map((skillId) => ({ skillId })) }
          : undefined,
      },
      include: jobInclude,
    });

    return job;
  }

  // ── GET /jobs (with filters) ──────────────────────────────────────────────
  async findAll(filters: FilterJobsDto) {
    const { search, location, jobType, skillId } = filters;

    return this.prisma.job.findMany({
      where: {
        isActive: true,
        ...(location && { location: { contains: location, mode: 'insensitive' } }),
        ...(jobType && { jobType }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(skillId && { skills: { some: { skillId } } }),
      },
      include: jobInclude,
      orderBy: { postedAt: 'desc' },
    });
  }

  // ── GET /jobs/:id ─────────────────────────────────────────────────────────
  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        ...jobInclude,
        applications: {
          select: { id: true, status: true, appliedAt: true },
        },
      },
    });

    if (!job) throw new NotFoundException(`Job ${id} not found`);
    return job;
  }

  // ── POST /jobs/:id/apply ──────────────────────────────────────────────────
  async apply(jobId: string, userId: string, userRole: string) {
    if (userRole !== Role.LEARNER) {
      throw new ForbiddenException('Only learners can apply for jobs');
    }

    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException(`Job ${jobId} not found`);
    if (!job.isActive) throw new BadRequestException('This job is no longer accepting applications');

    const existing = await this.prisma.application.findUnique({
      where: { userId_jobId: { userId, jobId } },
    });
    if (existing) throw new ConflictException('You have already applied for this job');

    return this.prisma.application.create({
      data: { userId, jobId },
      include: {
        job: { select: { id: true, title: true, slug: true } },
      },
    });
  }

  // ── PATCH /applications/:id/status ───────────────────────────────────────
  async updateApplicationStatus(
    applicationId: string,
    userId: string,
    userRole: string,
    dto: UpdateApplicationStatusDto,
  ) {
    if (userRole !== Role.EMPLOYER && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Only employers can update application status');
    }

    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: { select: { employer: { select: { users: { select: { id: true } } } } } } },
    });

    if (!application) throw new NotFoundException(`Application ${applicationId} not found`);

    const isOwner = application.job.employer.users.some((u) => u.id === userId);
    if (!isOwner && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You can only update applications for your own jobs');
    }

    return this.prisma.application.update({
      where: { id: applicationId },
      data: { status: dto.status },
      include: {
        job: { select: { id: true, title: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  // ── GET /jobs/recommended ─────────────────────────────────────────────────
  async getRecommended(userId: string) {
    const userSkills = await this.prisma.userSkill.findMany({
      where: { userId },
      select: { skillId: true },
    });

    const userSkillIds = new Set(userSkills.map((s) => s.skillId));

    const jobs = await this.prisma.job.findMany({
      where: { isActive: true },
      include: jobInclude,
    });

    if (userSkillIds.size === 0) {
      return jobs.slice(0, 10).map((j) => ({ ...j, matchScore: 0 }));
    }

    return jobs
      .map((job) => {
        const overlap = job.skills.filter((s) => userSkillIds.has(s.skillId)).length;
        return { ...job, matchScore: overlap };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);
  }

  // ── GET /applications ─────────────────────────────────────────────────────
  async getApplications(userId: string, userRole: string) {
    if (userRole === Role.LEARNER) {
      return this.prisma.application.findMany({
        where: { userId },
        include: {
          job: {
            select: {
              id: true, title: true, slug: true, location: true, jobType: true,
              employer: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { appliedAt: 'desc' },
      });
    }

    // EMPLOYER — see all applications across their org's jobs
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    if (!user?.organizationId) return [];

    return this.prisma.application.findMany({
      where: { job: { employerId: user.organizationId } },
      include: {
        user: { select: { id: true, name: true, email: true } },
        job: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { appliedAt: 'desc' },
    });
  }
}
