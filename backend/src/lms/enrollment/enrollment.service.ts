import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

@Injectable()
export class EnrollmentService {
  constructor(private readonly prisma: PrismaService) {}

  async enroll(userId: string, dto: CreateEnrollmentDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });
    if (!course) throw new NotFoundException(`Course ${dto.courseId} not found`);

    const existing = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: dto.courseId } },
    });
    if (existing) throw new ConflictException('Already enrolled in this course');

    return this.prisma.enrollment.create({
      data: { userId, courseId: dto.courseId },
      include: {
        course: { select: { id: true, title: true, slug: true } },
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
            _count: { select: { modules: true } },
          },
        },
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async findOne(enrollmentId: string, userId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: { include: { modules: { orderBy: { order: 'asc' } } } },
      },
    });

    if (!enrollment || enrollment.userId !== userId) {
      throw new NotFoundException(`Enrollment ${enrollmentId} not found`);
    }

    return enrollment;
  }
}
