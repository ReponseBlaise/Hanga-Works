import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
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

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const { skills, ...userData } = dto;

    const user = await this.prisma.user.update({
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
}
