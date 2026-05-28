import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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

  async findAllMentors() {
    return this.prisma.mentorProfile.findMany({
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });
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
}
