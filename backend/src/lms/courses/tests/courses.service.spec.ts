import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CoursesService } from '../courses.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { RedisService } from '../../../redis/redis.service';

const mockCourse = {
  id: 'course-uuid-1',
  title: 'Full-Stack Web Development',
  slug: 'full-stack-web-dev',
  description: 'Learn to build full-stack apps.',
  published: true,
  thumbnailUrl: null,
  institutionId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  course: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  courseModule: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  enrollment: {
    count: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
};

const adminUser = {
  userId: 'admin-1',
  email: 'admin@hanga.rw',
  role: 'ADMIN',
};

const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

describe('CoursesService', () => {
  let service: CoursesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns cached courses when cache hit', async () => {
      const cached = [mockCourse];
      const serialized = JSON.stringify(cached);
      mockRedis.get.mockResolvedValue(serialized);

      const result = await service.findAll();

      expect(mockRedis.get).toHaveBeenCalledWith('courses:all');
      expect(mockPrisma.course.findMany).not.toHaveBeenCalled();
      // Dates become ISO strings after JSON round-trip — compare serialised form
      expect(JSON.stringify(result)).toBe(serialized);
    });

    it('queries DB and sets cache on cache miss', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.course.findMany.mockResolvedValue([mockCourse]);

      const result = await service.findAll();

      expect(mockPrisma.course.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { published: true } }),
      );
      expect(mockRedis.set).toHaveBeenCalledWith(
        'courses:all',
        JSON.stringify([mockCourse]),
        300,
      );
      expect(result).toEqual([mockCourse]);
    });
  });

  describe('findOne', () => {
    it('returns a course by id', async () => {
      mockPrisma.course.findUnique.mockResolvedValue(mockCourse);
      const result = await service.findOne('course-uuid-1');
      expect(result).toEqual(mockCourse);
      expect(mockPrisma.course.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'course-uuid-1' } }),
      );
    });

    it('throws NotFoundException when course not found', async () => {
      mockPrisma.course.findUnique.mockResolvedValue(null);
      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates a course and invalidates cache', async () => {
      const dto = {
        title: 'New Course',
        slug: 'new-course',
        description: 'A brand new course description.',
      };
      mockPrisma.course.findUnique.mockResolvedValue(null);
      mockPrisma.course.create.mockResolvedValue({ ...mockCourse, ...dto });

      const result = await service.create(dto, adminUser);

      expect(mockPrisma.course.create).toHaveBeenCalled();
      expect(mockRedis.del).toHaveBeenCalledWith('courses:all');
      expect(result.title).toBe('New Course');
    });

    it('rejects learners from creating courses', async () => {
      const dto = {
        title: 'New Course',
        slug: 'new-course',
        description: 'A brand new course description.',
      };

      await expect(
        service.create(dto, { userId: 'u1', email: 'l@x.com', role: 'LEARNER' }),
      ).rejects.toThrow('Only admins and institutions can manage courses');
    });
  });

  describe('update', () => {
    it('updates a course when user is admin', async () => {
      mockPrisma.course.findUnique.mockResolvedValue(mockCourse);
      mockPrisma.course.findFirst.mockResolvedValue(null);
      mockPrisma.course.update.mockResolvedValue({
        ...mockCourse,
        title: 'Updated',
      });

      const result = await service.update(
        'course-uuid-1',
        { title: 'Updated' },
        adminUser,
      );

      expect(result.title).toBe('Updated');
      expect(mockRedis.del).toHaveBeenCalledWith('courses:all');
    });
  });
});
