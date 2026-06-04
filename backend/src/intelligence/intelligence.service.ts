import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IntelligenceService {
  constructor(private prisma: PrismaService) {}

  async getSkillGapAnalysis(userId: string, targetJobId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { skills: { include: { skill: true } } },
    });
    if (!user) throw new NotFoundException('User not found');

    const job = await this.prisma.job.findUnique({
      where: { id: targetJobId },
      include: { skills: { include: { skill: true } } },
    });
    if (!job) throw new NotFoundException('Job not found');

    const userSkillNames = new Set(user.skills.map((s) => s.skill.name.toLowerCase()));
    const jobSkillNames = job.skills.map((s) => s.skill.name.toLowerCase());

    const missingSkills = jobSkillNames.filter((s) => !userSkillNames.has(s));
    const matchingSkills = jobSkillNames.filter((s) => userSkillNames.has(s));

    const matchScore =
      jobSkillNames.length > 0
        ? Math.round((matchingSkills.length / jobSkillNames.length) * 100)
        : 100;

    return {
      targetJob: job.title,
      matchScore,
      matchingSkills,
      missingSkills,
    };
  }

  async getCareerPathway(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { skills: { include: { skill: true } } },
    });

    if (!user) throw new NotFoundException('User not found');

    const userSkillIds = new Set(user.skills.map(s => s.skillId));

    const demand = await this.prisma.jobSkill.groupBy({
      by: ['skillId'],
      _count: { skillId: true },
      orderBy: { _count: { skillId: 'desc' } },
      take: 10,
    });

    const recommendedSkills = demand.filter((d) => !userSkillIds.has(d.skillId));
    const skillIds = recommendedSkills.map((rs) => rs.skillId);

    const courses =
      skillIds.length === 0
        ? await this.prisma.course.findMany({
            where: { published: true },
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { skills: { include: { skill: true } } },
          })
        : await this.prisma.course.findMany({
            where: {
              published: true,
              skills: { some: { skillId: { in: skillIds } } },
            },
            take: 5,
            include: { skills: { include: { skill: true } } },
          });

    return {
      currentLevel: 'Entry Level',
      nextMilestone: 'Advanced Practitioner',
      recommendedCourses: courses,
      trendingSkillsToLearn: recommendedSkills,
    };
  }
}
