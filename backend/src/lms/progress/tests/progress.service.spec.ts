import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { EnrollmentStatus } from '@prisma/client';
import { ProgressService } from '../progress.service';
import { PrismaService } from '../../../prisma/prisma.service';

const LEARNER_ID = 'user-uuid-1';
const ENROLLMENT_ID = 'enrollment-uuid-1';
const MODULE_ID = 'module-uuid-1';

const mockModules = [
  { id: MODULE_ID, title: 'Module 1', order: 1, courseId: 'c1', content: null, videoUrl: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'module-uuid-2', title: 'Module 2', order: 2, courseId: 'c1', content: null, videoUrl: null, createdAt: new Date(), updatedAt: new Date() },
];

const mockEnrollment = {
  id: ENROLLMENT_ID,
  userId: LEARNER_ID,
  courseId: 'c1',
  progress: 0,
  status: EnrollmentStatus.ENROLLED,
  startedAt: new Date(),
  completedAt: null,
  updatedAt: new Date(),
  course: { id: 'c1', title: 'Test Course', modules: mockModules },
};

const mockPrisma = {
  enrollment: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

describe('ProgressService', () => {
  let service: ProgressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ProgressService>(ProgressService);
    jest.clearAllMocks();
  });

  describe('updateProgress', () => {
    it('updates progress and sets status to IN_PROGRESS', async () => {
      mockPrisma.enrollment.findUnique.mockResolvedValue(mockEnrollment);
      mockPrisma.enrollment.update.mockResolvedValue({
        ...mockEnrollment,
        progress: 50,
        status: EnrollmentStatus.IN_PROGRESS,
      });

      const result = await service.updateProgress(ENROLLMENT_ID, LEARNER_ID, {
        progress: 50,
      });

      expect(mockPrisma.enrollment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: ENROLLMENT_ID },
          data: expect.objectContaining({ progress: 50, status: EnrollmentStatus.IN_PROGRESS }),
        }),
      );
      expect(result.progress).toBe(50);
    });

    it('sets status COMPLETED and completedAt when progress is 100', async () => {
      mockPrisma.enrollment.findUnique.mockResolvedValue(mockEnrollment);
      mockPrisma.enrollment.update.mockResolvedValue({
        ...mockEnrollment,
        progress: 100,
        status: EnrollmentStatus.COMPLETED,
        completedAt: new Date(),
      });

      const result = await service.updateProgress(ENROLLMENT_ID, LEARNER_ID, {
        progress: 100,
      });

      expect(mockPrisma.enrollment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: EnrollmentStatus.COMPLETED,
            completedAt: expect.any(Date),
          }),
        }),
      );
      expect(result.status).toBe(EnrollmentStatus.COMPLETED);
    });

    it('throws NotFoundException when enrollment not found', async () => {
      mockPrisma.enrollment.findUnique.mockResolvedValue(null);
      await expect(
        service.updateProgress('bad-id', LEARNER_ID, { progress: 50 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when user does not own enrollment', async () => {
      mockPrisma.enrollment.findUnique.mockResolvedValue({
        ...mockEnrollment,
        userId: 'other-user',
      });
      await expect(
        service.updateProgress(ENROLLMENT_ID, LEARNER_ID, { progress: 50 }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('submitQuiz', () => {
    it('returns failed result when score is below 70', async () => {
      mockPrisma.enrollment.findUnique.mockResolvedValue(mockEnrollment);

      const result = await service.submitQuiz(MODULE_ID, LEARNER_ID, {
        enrollmentId: ENROLLMENT_ID,
        score: 55,
      });

      expect(result.passed).toBe(false);
      expect(result.score).toBe(55);
      expect(mockPrisma.enrollment.update).not.toHaveBeenCalled();
    });

    it('updates progress when score passes (>= 70)', async () => {
      mockPrisma.enrollment.findUnique.mockResolvedValue(mockEnrollment);
      mockPrisma.enrollment.update.mockResolvedValue({
        ...mockEnrollment,
        progress: 50,
        status: EnrollmentStatus.IN_PROGRESS,
      });

      const result = await service.submitQuiz(MODULE_ID, LEARNER_ID, {
        enrollmentId: ENROLLMENT_ID,
        score: 85,
      });

      expect(result.passed).toBe(true);
      expect(mockPrisma.enrollment.update).toHaveBeenCalled();
    });

    it('throws NotFoundException when module not in course', async () => {
      mockPrisma.enrollment.findUnique.mockResolvedValue(mockEnrollment);

      await expect(
        service.submitQuiz('wrong-module-id', LEARNER_ID, {
          enrollmentId: ENROLLMENT_ID,
          score: 90,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when user does not own enrollment', async () => {
      mockPrisma.enrollment.findUnique.mockResolvedValue({
        ...mockEnrollment,
        userId: 'other-user',
      });

      await expect(
        service.submitQuiz(MODULE_ID, LEARNER_ID, {
          enrollmentId: ENROLLMENT_ID,
          score: 90,
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
