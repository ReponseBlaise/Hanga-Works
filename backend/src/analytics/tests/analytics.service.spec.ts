import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentStatus } from '@prisma/client';
import { AnalyticsService } from '../analytics.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockPrisma = {
  user:          { count: jest.fn() },
  enrollment:    { count: jest.fn(), findMany: jest.fn() },
  job:           { count: jest.fn() },
  application:   { count: jest.fn() },
  certification: { count: jest.fn() },
};

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    jest.clearAllMocks();
  });

  describe('getOverview', () => {
    it('returns platform stats with correct completion rate', async () => {
      mockPrisma.user.count
        .mockResolvedValueOnce(25)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(18);
      mockPrisma.enrollment.count
        .mockResolvedValueOnce(40)
        .mockResolvedValueOnce(10);
      mockPrisma.job.count.mockResolvedValue(20);
      mockPrisma.application.count.mockResolvedValue(30);
      mockPrisma.certification.count.mockResolvedValue(10);

      const result = await service.getOverview();

      expect(result.totalUsers).toBe(25);
      expect(result.dau).toBe(5);
      expect(result.completionRate).toBe('25%');
      expect(result.activeJobs).toBe(20);
    });

    it('returns 0% completion rate when no enrollments', async () => {
      mockPrisma.user.count.mockResolvedValue(0);
      mockPrisma.enrollment.count.mockResolvedValue(0);
      mockPrisma.job.count.mockResolvedValue(0);
      mockPrisma.application.count.mockResolvedValue(0);
      mockPrisma.certification.count.mockResolvedValue(0);

      const result = await service.getOverview();
      expect(result.completionRate).toBe('0%');
    });
  });

  describe('exportCsv', () => {
    it('returns CSV string with headers and rows', async () => {
      mockPrisma.enrollment.findMany.mockResolvedValue([
        {
          id: 'enroll-1',
          progress: 100,
          status: EnrollmentStatus.COMPLETED,
          startedAt: new Date('2026-05-01'),
          completedAt: new Date('2026-05-23'),
          user: { id: 'user-1', name: 'Sophie Niyomugabo', email: 'sophie@email.rw' },
          course: { id: 'course-1', title: 'Backend Development with Node.js' },
        },
      ]);

      const result = await service.exportCsv();
      expect(result).toContain('enrollmentId,userId,userName');
      expect(result).toContain('Sophie Niyomugabo');
      expect(result).toContain('COMPLETED');
    });

    it('returns only headers when no enrollments exist', async () => {
      mockPrisma.enrollment.findMany.mockResolvedValue([]);
      const result = await service.exportCsv();
      const lines = result.split('\n');
      expect(lines).toHaveLength(1);
      expect(lines[0]).toContain('enrollmentId');
    });
  });
});
