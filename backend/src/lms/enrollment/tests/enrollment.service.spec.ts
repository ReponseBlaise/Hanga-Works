import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { EnrollmentService } from '../enrollment.service';
import { PrismaService } from '../../../prisma/prisma.service';

const LEARNER_ID = 'user-uuid-1';
const COURSE_ID = 'course-uuid-1';
const ENROLLMENT_ID = 'enrollment-uuid-1';

const mockCourse = { id: COURSE_ID, title: 'Full-Stack Web Dev' };
const mockEnrollment = {
  id: ENROLLMENT_ID,
  userId: LEARNER_ID,
  courseId: COURSE_ID,
  progress: 0,
  status: 'ENROLLED',
  startedAt: new Date(),
  completedAt: null,
  course: mockCourse,
};

const mockPrisma = {
  course: { findUnique: jest.fn() },
  enrollment: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
  },
};

describe('EnrollmentService', () => {
  let service: EnrollmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<EnrollmentService>(EnrollmentService);
    jest.clearAllMocks();
  });

  describe('enroll', () => {
    it('creates an enrollment successfully', async () => {
      mockPrisma.course.findUnique.mockResolvedValue(mockCourse);
      mockPrisma.enrollment.findUnique.mockResolvedValue(null);
      mockPrisma.enrollment.create.mockResolvedValue(mockEnrollment);

      const result = await service.enroll(LEARNER_ID, { courseId: COURSE_ID });

      expect(mockPrisma.enrollment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { userId: LEARNER_ID, courseId: COURSE_ID },
        }),
      );
      expect(result).toEqual(mockEnrollment);
    });

    it('throws NotFoundException when course does not exist', async () => {
      mockPrisma.course.findUnique.mockResolvedValue(null);
      await expect(
        service.enroll(LEARNER_ID, { courseId: 'bad-id' }),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrisma.enrollment.create).not.toHaveBeenCalled();
    });

    it('throws ConflictException when already enrolled', async () => {
      mockPrisma.course.findUnique.mockResolvedValue(mockCourse);
      mockPrisma.enrollment.findUnique.mockResolvedValue(mockEnrollment);

      await expect(
        service.enroll(LEARNER_ID, { courseId: COURSE_ID }),
      ).rejects.toThrow(ConflictException);
      expect(mockPrisma.enrollment.create).not.toHaveBeenCalled();
    });
  });

  describe('findByUser', () => {
    it('returns all enrollments for a user', async () => {
      mockPrisma.enrollment.findMany.mockResolvedValue([mockEnrollment]);
      const result = await service.findByUser(LEARNER_ID);
      expect(mockPrisma.enrollment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: LEARNER_ID } }),
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('returns enrollment when user owns it', async () => {
      mockPrisma.enrollment.findUnique.mockResolvedValue(mockEnrollment);
      const result = await service.findOne(ENROLLMENT_ID, LEARNER_ID);
      expect(result).toEqual(mockEnrollment);
    });

    it('throws NotFoundException when enrollment belongs to another user', async () => {
      mockPrisma.enrollment.findUnique.mockResolvedValue({
        ...mockEnrollment,
        userId: 'other-user',
      });
      await expect(
        service.findOne(ENROLLMENT_ID, LEARNER_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when enrollment does not exist', async () => {
      mockPrisma.enrollment.findUnique.mockResolvedValue(null);
      await expect(
        service.findOne('nonexistent', LEARNER_ID),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
