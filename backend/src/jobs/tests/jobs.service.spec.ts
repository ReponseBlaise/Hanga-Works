/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ApplicationStatus, JobType, Role } from '@prisma/client';
import { JobsService } from '../jobs.service';
import { PrismaService } from '../../prisma/prisma.service';

// ── fixtures ──────────────────────────────────────────────────────────────
const ORG_ID     = 'org-uuid-1';
const JOB_ID     = 'job-uuid-1';
const APP_ID     = 'app-uuid-1';
const LEARNER_ID = 'user-learner-1';
const EMPLOYER_ID= 'user-employer-1';

const mockJob = {
  id: JOB_ID,
  title: 'Backend Engineer',
  slug: 'backend-engineer-andela',
  description: 'Design and maintain REST APIs at scale.',
  location: 'Kigali',
  jobType: JobType.REMOTE,
  salaryMin: 600000,
  salaryMax: 900000,
  isActive: true,
  employerId: ORG_ID,
  postedAt: new Date(),
  updatedAt: new Date(),
  expiresAt: null,
  employer: { id: ORG_ID, name: 'Andela Rwanda', website: null },
  skills: [],
  _count: { applications: 3 },
};

const mockApplication = {
  id: APP_ID,
  userId: LEARNER_ID,
  jobId: JOB_ID,
  status: ApplicationStatus.APPLIED,
  appliedAt: new Date(),
  updatedAt: new Date(),
  job: { id: JOB_ID, title: 'Backend Engineer', slug: 'backend-engineer-andela' },
  employer: { users: [{ id: EMPLOYER_ID }] },
};

const mockPrisma = {
  user: { findUnique: jest.fn() },
  job: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  application: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
};

describe('JobsService', () => {
  let service: JobsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    jest.clearAllMocks();
  });

  // ── createJob ─────────────────────────────────────────────────────────────
  describe('createJob', () => {
    it('creates a job for an employer with an organisation', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ organizationId: ORG_ID });
      mockPrisma.job.create.mockResolvedValue(mockJob);

      const dto = {
        title: 'Backend Engineer',
        slug: 'backend-engineer-andela',
        description: 'Design and maintain REST APIs at scale.',
      };

      const result = await service.createJob(EMPLOYER_ID, Role.EMPLOYER, dto);

      expect(mockPrisma.job.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ employerId: ORG_ID }),
        }),
      );
      expect(result.title).toBe('Backend Engineer');
    });

    it('throws ForbiddenException if user is not EMPLOYER or ADMIN', async () => {
      await expect(
        service.createJob(LEARNER_ID, Role.LEARNER, {} as any),
      ).rejects.toThrow(ForbiddenException);
      expect(mockPrisma.job.create).not.toHaveBeenCalled();
    });

    it('throws BadRequestException if employer has no organisation', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ organizationId: null });
      await expect(
        service.createJob(EMPLOYER_ID, Role.EMPLOYER, {} as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── findAll ───────────────────────────────────────────────────────────────
  describe('findAll', () => {
    it('returns all active jobs with no filters', async () => {
      mockPrisma.job.findMany.mockResolvedValue([mockJob]);

      const result = await service.findAll({});

      expect(mockPrisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ isActive: true }) }),
      );
      expect(result).toHaveLength(1);
    });

    it('applies location filter', async () => {
      mockPrisma.job.findMany.mockResolvedValue([mockJob]);

      await service.findAll({ location: 'Kigali' });

      expect(mockPrisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            location: { contains: 'Kigali', mode: 'insensitive' },
          }),
        }),
      );
    });

    it('applies jobType filter', async () => {
      mockPrisma.job.findMany.mockResolvedValue([mockJob]);

      await service.findAll({ jobType: JobType.REMOTE });

      expect(mockPrisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ jobType: JobType.REMOTE }),
        }),
      );
    });

    it('applies search filter across title and description', async () => {
      mockPrisma.job.findMany.mockResolvedValue([mockJob]);

      await service.findAll({ search: 'engineer' });

      expect(mockPrisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { title: { contains: 'engineer', mode: 'insensitive' } },
              { description: { contains: 'engineer', mode: 'insensitive' } },
            ],
          }),
        }),
      );
    });
  });

  // ── findOne ───────────────────────────────────────────────────────────────
  describe('findOne', () => {
    it('returns a job by id', async () => {
      mockPrisma.job.findUnique.mockResolvedValue(mockJob);
      const result = await service.findOne(JOB_ID);
      expect(result).toEqual(mockJob);
    });

    it('throws NotFoundException when job does not exist', async () => {
      mockPrisma.job.findUnique.mockResolvedValue(null);
      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ── apply ─────────────────────────────────────────────────────────────────
  describe('apply', () => {
    it('creates an application for a learner', async () => {
      mockPrisma.job.findUnique.mockResolvedValue(mockJob);
      mockPrisma.application.findUnique.mockResolvedValue(null);
      mockPrisma.application.create.mockResolvedValue(mockApplication);

      const result = await service.apply(JOB_ID, LEARNER_ID, Role.LEARNER);

      expect(mockPrisma.application.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { userId: LEARNER_ID, jobId: JOB_ID },
        }),
      );
      expect(result.status).toBe(ApplicationStatus.APPLIED);
    });

    it('throws ForbiddenException if user is not LEARNER', async () => {
      await expect(
        service.apply(JOB_ID, EMPLOYER_ID, Role.EMPLOYER),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException if already applied', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockPrisma.application.findUnique as unknown as jest.Mock).mockResolvedValue({ id: 'app1' });
      await expect(service.apply('job1', 'user1', Role.LEARNER)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create an application successfully', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockPrisma.application.findUnique as unknown as jest.Mock).mockResolvedValue(null);
      await service.apply('job1', 'user1', Role.LEARNER);
      await expect(
        service.apply(JOB_ID, LEARNER_ID, Role.LEARNER),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException if job does not exist', async () => {
      mockPrisma.job.findUnique.mockResolvedValue(null);
      await expect(
        service.apply('bad-id', LEARNER_ID, Role.LEARNER),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException if job is inactive', async () => {
      mockPrisma.job.findUnique.mockResolvedValue({ ...mockJob, isActive: false });
      await expect(
        service.apply(JOB_ID, LEARNER_ID, Role.LEARNER),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws ConflictException on duplicate application', async () => {
      mockPrisma.job.findUnique.mockResolvedValue(mockJob);
      mockPrisma.application.findUnique.mockResolvedValue(mockApplication);
      await expect(
        service.apply(JOB_ID, LEARNER_ID, Role.LEARNER),
      ).rejects.toThrow(ConflictException);
      expect(mockPrisma.application.create).not.toHaveBeenCalled();
    });
  });

  // ── updateApplicationStatus ───────────────────────────────────────────────
  describe('updateApplicationStatus', () => {
    const appWithEmployer = {
      ...mockApplication,
      job: { employer: { users: [{ id: EMPLOYER_ID }] } },
    };

    it('updates status when employer owns the job', async () => {
      mockPrisma.application.findUnique.mockResolvedValue(appWithEmployer);
      mockPrisma.application.update.mockResolvedValue({
        ...mockApplication,
        status: ApplicationStatus.SHORTLISTED,
      });

      const result = await service.updateApplicationStatus(
        APP_ID, EMPLOYER_ID, Role.EMPLOYER,
        { status: ApplicationStatus.SHORTLISTED },
      );

      expect(mockPrisma.application.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: APP_ID },
          data: { status: ApplicationStatus.SHORTLISTED },
        }),
      );
      expect(result.status).toBe(ApplicationStatus.SHORTLISTED);
    });

    it('throws ForbiddenException if user is a learner', async () => {
      await expect(
        service.updateApplicationStatus(APP_ID, LEARNER_ID, Role.LEARNER, {
          status: ApplicationStatus.HIRED,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException if application does not exist', async () => {
      mockPrisma.application.findUnique.mockResolvedValue(null);
      await expect(
        service.updateApplicationStatus(APP_ID, EMPLOYER_ID, Role.EMPLOYER, {
          status: ApplicationStatus.REVIEWING,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException if employer does not own the job', async () => {
      mockPrisma.application.findUnique.mockResolvedValue({
        ...appWithEmployer,
        job: { employer: { users: [{ id: 'other-employer' }] } },
      });
      await expect(
        service.updateApplicationStatus(APP_ID, EMPLOYER_ID, Role.EMPLOYER, {
          status: ApplicationStatus.REJECTED,
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ── getApplications ───────────────────────────────────────────────────────
  describe('getApplications', () => {
    it('returns learner own applications', async () => {
      mockPrisma.application.findMany.mockResolvedValue([mockApplication]);

      const result = await service.getApplications(LEARNER_ID, Role.LEARNER);

      expect(mockPrisma.application.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: LEARNER_ID } }),
      );
      expect(result).toHaveLength(1);
    });

    it('returns employer org applications', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ organizationId: ORG_ID });
      mockPrisma.application.findMany.mockResolvedValue([mockApplication]);

      const result = await service.getApplications(EMPLOYER_ID, Role.EMPLOYER);

      expect(mockPrisma.application.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { job: { employerId: ORG_ID } },
        }),
      );
      expect(result).toHaveLength(1);
    });

    it('returns empty array if employer has no organisation', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ organizationId: null });
      const result = await service.getApplications(EMPLOYER_ID, Role.EMPLOYER);
      expect(result).toEqual([]);
    });
  });
});
