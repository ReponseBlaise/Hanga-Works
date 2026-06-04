import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { CreateMentorDto } from './dto/create-mentor.dto';
import { BookSessionDto } from './dto/book-session.dto';

@Injectable()
export class MentorshipService {
  constructor(private prisma: PrismaService) {}

  async createProfile(userId: string, dto: CreateMentorDto) {
    return this.prisma.mentorProfile.upsert({
      where: { userId },
      update: dto,
      create: {
        userId,
        ...dto,
      },
    });
  }

  async createInstitutionMentor(institutionUserId: string, data: { name: string, email: string, password?: string, expertise: string, hourlyRate?: number }) {
    const institutionUser = await this.prisma.user.findUnique({
      where: { id: institutionUserId },
      select: { organizationId: true, role: true }
    });

    if (institutionUser?.role !== 'INSTITUTION' && institutionUser?.role !== 'ADMIN') {
      throw new ForbiddenException('Only institutions or admins can create mentors');
    }

    const orgId = institutionUser.organizationId;
    
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email already in use');

    const passwordToHash = data.password && data.password.trim().length > 0 ? data.password : 'Mentor@123!';
    const passwordHash = await bcrypt.hash(passwordToHash, 10);

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: 'MENTOR',
        organizationId: orgId,
        mentorProfile: {
          create: {
            expertise: data.expertise,
            hourlyRate: data.hourlyRate || 0,
          }
        }
      },
      include: { mentorProfile: true }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (user as any).passwordHash;
    return user;
  }

  async findAllMentors() {
    return this.prisma.mentorProfile.findMany({
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });
  }

  async findMentorById(id: string) {
    const mentor = await this.prisma.mentorProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });
    if (!mentor) throw new NotFoundException('Mentor not found');
    return mentor;
  }

  async bookSession(menteeId: string, dto: BookSessionDto) {
    const mentor = await this.prisma.mentorProfile.findUnique({
      where: { id: dto.mentorId },
    });

    if (!mentor) throw new NotFoundException('Mentor not found');
    if (mentor.userId === menteeId) throw new ConflictException('Cannot book yourself');

    return this.prisma.mentorSession.create({
      data: {
        mentorId: dto.mentorId,
        menteeId,
        scheduledAt: new Date(dto.scheduledAt),
        durationMinutes: dto.durationMinutes || 60,
      },
      include: {
        mentor: { include: { user: true } },
      },
    });
  }

  async getMySessions(userId: string, role: string) {
    if (role === 'MENTOR') {
      const mentor = await this.prisma.mentorProfile.findUnique({ where: { userId } });
      if (!mentor) return [];
      return this.prisma.mentorSession.findMany({
        where: { mentorId: mentor.id },
        include: { mentee: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        orderBy: { scheduledAt: 'asc' }
      });
    } else {
      return this.prisma.mentorSession.findMany({
        where: { menteeId: userId },
        include: { mentor: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } } },
        orderBy: { scheduledAt: 'asc' }
      });
    }
  }

  private async getSessionForMentor(sessionId: string, userId: string) {
    const session = await this.prisma.mentorSession.findUnique({
      where: { id: sessionId },
      include: { mentor: true },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.mentor.userId !== userId) throw new ForbiddenException('Not your session');
    return session;
  }

  async acceptSession(sessionId: string, userId: string) {
    await this.getSessionForMentor(sessionId, userId);
    return this.prisma.mentorSession.update({
      where: { id: sessionId },
      data: { status: 'ACCEPTED' },
    });
  }

  async rejectSession(sessionId: string, userId: string) {
    await this.getSessionForMentor(sessionId, userId);
    return this.prisma.mentorSession.update({
      where: { id: sessionId },
      data: { status: 'REJECTED' },
    });
  }

  async completeSession(sessionId: string, userId: string) {
    await this.getSessionForMentor(sessionId, userId);
    return this.prisma.mentorSession.update({
      where: { id: sessionId },
      data: { status: 'COMPLETED' },
    });
  }

  async addReview(sessionId: string, menteeId: string, rating: number, feedback?: string) {
    const session = await this.prisma.mentorSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');
    if (session.menteeId !== menteeId) throw new ForbiddenException('Not your session');
    if (session.status !== 'COMPLETED') throw new ConflictException('Session not completed');
    return this.prisma.sessionReview.upsert({
      where: { sessionId },
      update: { rating, feedback },
      create: { sessionId, rating, feedback },
    });
  }
}
