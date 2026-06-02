import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { CurrentUserPayload } from '../../auth/decorators/current-user.decorator';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { AttachModuleMediaDto } from './dto/attach-module-media.dto';

const COURSES_CACHE_KEY = 'courses:all';
const COURSES_TTL = 300; // 5 minutes

const courseListInclude = {
  institution: { select: { id: true, name: true } },
  skills: { include: { skill: true } },
  _count: { select: { enrollments: true, modules: true } },
} as const;

const courseDetailInclude = {
  institution: { select: { id: true, name: true, website: true } },
  modules: { orderBy: { order: 'asc' as const } },
  skills: { include: { skill: true } },
  _count: { select: { enrollments: true } },
} as const;

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private async invalidateCache() {
    await this.redis.del(COURSES_CACHE_KEY);
  }

  private assertCanManage(role: string) {
    if (role !== Role.ADMIN && role !== Role.INSTITUTION) {
      throw new ForbiddenException('Only admins and institutions can manage courses');
    }
  }

  private async resolveInstitutionId(
    userId: string,
    role: string,
    institutionId?: string,
  ): Promise<string | undefined> {
    if (role === Role.ADMIN) {
      return institutionId;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    if (!user?.organizationId) {
      throw new BadRequestException(
        'Your institution account is not linked to an organisation',
      );
    }

    return user.organizationId;
  }

  private async getCourseForManage(courseId: string, user: CurrentUserPayload) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException(`Course ${courseId} not found`);
    }

    if (user.role === Role.ADMIN) {
      return course;
    }

    if (user.role === Role.INSTITUTION) {
      const account = await this.prisma.user.findUnique({
        where: { id: user.userId },
        select: { organizationId: true },
      });

      if (
        account?.organizationId &&
        course.institutionId === account.organizationId
      ) {
        return course;
      }
    }

    throw new ForbiddenException('You cannot manage this course');
  }

  async findAll() {
    const cached = await this.redis.get(COURSES_CACHE_KEY);
    if (cached) return JSON.parse(cached);

    const courses = await this.prisma.course.findMany({
      where: { published: true },
      include: courseListInclude,
      orderBy: { createdAt: 'desc' },
    });

    await this.redis.set(
      COURSES_CACHE_KEY,
      JSON.stringify(courses),
      COURSES_TTL,
    );
    return courses;
  }

  async findAllManageable(user: CurrentUserPayload) {
    this.assertCanManage(user.role);

    const where =
      user.role === Role.ADMIN
        ? {}
        : {
            institutionId: await this.resolveInstitutionId(
              user.userId,
              user.role,
            ),
          };

    return this.prisma.course.findMany({
      where,
      include: courseListInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: courseDetailInclude,
    });

    if (!course) throw new NotFoundException(`Course ${id} not found`);
    return course;
  }

  async create(dto: CreateCourseDto, user: CurrentUserPayload) {
    this.assertCanManage(user.role);

    const institutionId = await this.resolveInstitutionId(
      user.userId,
      user.role,
      dto.institutionId,
    );

    const existingSlug = await this.prisma.course.findUnique({
      where: { slug: dto.slug },
    });
    if (existingSlug) {
      throw new BadRequestException(`Slug "${dto.slug}" is already in use`);
    }

    const course = await this.prisma.course.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        description: dto.description,
        published: dto.published ?? false,
        thumbnailUrl: dto.thumbnailUrl,
        institutionId,
      },
      include: courseDetailInclude,
    });

    await this.invalidateCache();
    return course;
  }

  async update(id: string, dto: UpdateCourseDto, user: CurrentUserPayload) {
    await this.getCourseForManage(id, user);

    if (dto.slug) {
      const slugTaken = await this.prisma.course.findFirst({
        where: { slug: dto.slug, id: { not: id } },
      });
      if (slugTaken) {
        throw new BadRequestException(`Slug "${dto.slug}" is already in use`);
      }
    }

    if (dto.institutionId && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can reassign course institution');
    }

    const course = await this.prisma.course.update({
      where: { id },
      data: dto,
      include: courseDetailInclude,
    });

    await this.invalidateCache();
    return course;
  }

  async remove(id: string, user: CurrentUserPayload) {
    await this.getCourseForManage(id, user);

    const enrollmentCount = await this.prisma.enrollment.count({
      where: { courseId: id },
    });
    if (enrollmentCount > 0) {
      throw new BadRequestException(
        'Cannot delete a course that has enrollments. Unpublish it instead.',
      );
    }

    await this.prisma.course.delete({ where: { id } });
    await this.invalidateCache();
    return { message: 'Course deleted successfully', id };
  }

  async addModule(
    courseId: string,
    dto: CreateModuleDto,
    user: CurrentUserPayload,
  ) {
    await this.getCourseForManage(courseId, user);

    let order = dto.order;
    if (order === undefined) {
      const last = await this.prisma.courseModule.findFirst({
        where: { courseId },
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      order = (last?.order ?? 0) + 1;
    }

    const module = await this.prisma.courseModule.create({
      data: {
        courseId,
        title: dto.title,
        content: dto.content,
        videoUrl: dto.videoUrl,
        order,
      },
    });

    await this.invalidateCache();
    return module;
  }

  async updateModule(
    courseId: string,
    moduleId: string,
    dto: UpdateModuleDto,
    user: CurrentUserPayload,
  ) {
    await this.getCourseForManage(courseId, user);
    await this.getModuleOrThrow(courseId, moduleId);

    const module = await this.prisma.courseModule.update({
      where: { id: moduleId },
      data: dto,
    });

    await this.invalidateCache();
    return module;
  }

  async removeModule(
    courseId: string,
    moduleId: string,
    user: CurrentUserPayload,
  ) {
    await this.getCourseForManage(courseId, user);
    await this.getModuleOrThrow(courseId, moduleId);

    await this.prisma.courseModule.delete({ where: { id: moduleId } });
    await this.invalidateCache();
    return { message: 'Module deleted successfully', id: moduleId };
  }

  async attachModuleMedia(
    courseId: string,
    moduleId: string,
    dto: AttachModuleMediaDto,
    user: CurrentUserPayload,
  ) {
    await this.getCourseForManage(courseId, user);
    await this.getModuleOrThrow(courseId, moduleId);

    const data: { content?: string; videoUrl?: string } = {};

    if (dto.mediaType === 'video') {
      if (!dto.publicUrl) {
        throw new BadRequestException('publicUrl is required for video lessons');
      }
      data.videoUrl = dto.publicUrl;
    } else if (dto.mediaType === 'notes') {
      if (!dto.notes?.trim()) {
        throw new BadRequestException('notes text is required for note lessons');
      }
      data.content = dto.notes;
    } else if (dto.mediaType === 'document') {
      if (!dto.publicUrl) {
        throw new BadRequestException('publicUrl is required for document uploads');
      }
      data.content = `[Document download](${dto.publicUrl})`;
    }

    const module = await this.prisma.courseModule.update({
      where: { id: moduleId },
      data,
    });

    await this.invalidateCache();
    return module;
  }

  async getModuleLesson(
    courseId: string,
    moduleId: string,
    user?: CurrentUserPayload,
  ) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, published: true, title: true },
    });
    if (!course) {
      throw new NotFoundException(`Course ${courseId} not found`);
    }

    if (!course.published) {
      if (!user) {
        throw new ForbiddenException('Sign in to access this lesson');
      }
      await this.getCourseForManage(courseId, user);
    } else {
      const canBypass =
        user?.role === Role.ADMIN || user?.role === Role.INSTITUTION;
      if (!canBypass) {
        const enrolled = user
          ? await this.prisma.enrollment.findUnique({
              where: {
                userId_courseId: { userId: user.userId, courseId },
              },
            })
          : null;

        if (!enrolled) {
          const firstModule = await this.prisma.courseModule.findFirst({
            where: { courseId },
            orderBy: { order: 'asc' },
            select: { id: true },
          });
          if (firstModule?.id !== moduleId) {
            throw new ForbiddenException(
              'Enroll in the course to access this lesson',
            );
          }
        }
      }
    }

    const module = await this.getModuleOrThrow(courseId, moduleId);

    return {
      course: { id: course.id, title: course.title },
      module: {
        id: module.id,
        title: module.title,
        order: module.order,
        content: module.content,
        videoUrl: module.videoUrl,
        lessonType: module.videoUrl
          ? module.content
            ? 'mixed'
            : 'video'
          : module.content
            ? 'notes'
            : 'empty',
      },
    };
  }

  private async getModuleOrThrow(courseId: string, moduleId: string) {
    const module = await this.prisma.courseModule.findFirst({
      where: { id: moduleId, courseId },
    });
    if (!module) {
      throw new NotFoundException(
        `Module ${moduleId} not found on course ${courseId}`,
      );
    }
    return module;
  }
}
