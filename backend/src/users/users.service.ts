import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { MediaUploadService } from '../storage/media-upload.service';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private readonly mediaUpload: MediaUploadService,
  ) {}

  async findAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        avatarUrl: true,
        location: true,
        createdAt: true,
      },
    });
  }

  async getPublicProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        role: true,
        bio: true,
        avatarUrl: true,
        location: true,
        createdAt: true,
        skills: {
          select: {
            skill: true,
            level: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        bio: true,
        avatarUrl: true,
        location: true,
        emailVerified: true,
        createdAt: true,
        skills: {
          select: {
            skill: true,
            level: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const { skills, ...userData } = dto;

    await this.prisma.user.update({
      where: { id: userId },
      data: userData,
    });

    if (skills) {
      await this.prisma.userSkill.deleteMany({
        where: { userId },
      });

      for (const s of skills) {
        let skill = await this.prisma.skill.findUnique({
          where: { name: s.skillName },
        });

        if (!skill) {
          skill = await this.prisma.skill.create({
            data: { name: s.skillName },
          });
        }

        await this.prisma.userSkill.create({
          data: {
            userId,
            skillId: skill.id,
            level: s.level,
          },
        });
      }
    }

    return this.getProfile(userId);
  }

  async getProfileSetupStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        bio: true,
        avatarUrl: true,
        location: true,
        phone: true,
        emailVerified: true,
        skills: { select: { id: true } },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const missing: string[] = [];
    if (!user.bio?.trim()) missing.push('bio');
    if (!user.avatarUrl?.trim()) missing.push('avatarUrl');
    if (!user.location?.trim()) missing.push('location');
    if (!user.phone?.trim()) missing.push('phone');
    if (!user.emailVerified) missing.push('emailVerified');
    if (user.skills.length === 0) missing.push('skills');

    const totalSteps = 6;
    const completedSteps = totalSteps - missing.length;

    return {
      complete: missing.length === 0,
      completedSteps,
      totalSteps,
      percentComplete: Math.round((completedSteps / totalSteps) * 100),
      missing,
    };
  }

  async uploadAvatar(user: CurrentUserPayload, file: Express.Multer.File) {
    const uploaded = await this.mediaUpload.uploadFile({
      purpose: 'avatar',
      file,
      user,
    });

    const profile = await this.updateProfile(user.userId, {
      avatarUrl: uploaded.publicUrl,
    });

    return {
      ...uploaded,
      profile,
    };
  }
}
