import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { CreateCourseDto } from './dto/create-course.dto';

const COURSES_CACHE_KEY = 'courses:all';
const COURSES_TTL = 300; // 5 minutes

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findAll() {
    const cached = await this.redis.get(COURSES_CACHE_KEY);
    if (cached) return JSON.parse(cached);

    const courses = await this.prisma.course.findMany({
      where: { published: true },
      include: {
        institution: { select: { id: true, name: true } },
        skills: { include: { skill: true } },
        _count: { select: { enrollments: true, modules: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    await this.redis.set(COURSES_CACHE_KEY, JSON.stringify(courses), COURSES_TTL);
    return courses;
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        institution: { select: { id: true, name: true, website: true } },
        modules: { orderBy: { order: 'asc' } },
        skills: { include: { skill: true } },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) throw new NotFoundException(`Course ${id} not found`);
    return course;
  }

  async create(dto: CreateCourseDto) {
    const course = await this.prisma.course.create({ data: dto });
    await this.redis.del(COURSES_CACHE_KEY); // invalidate cache
    return course;
  }
}
