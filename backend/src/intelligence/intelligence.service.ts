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

    const skills = await this.prisma.skill.findMany({
      where: { id: { in: skillIds } },
      select: { id: true, name: true },
    });

    const skillMap = new Map(skills.map((s) => [s.id, s.name]));

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

    const skillDetails = await this.prisma.skill.findMany({
      where: { id: { in: recommendedSkills.map(r => r.skillId) } },
      select: { id: true, name: true },
    });
    const skillMap = new Map(skillDetails.map(s => [s.id, s.name]));

    return {
      currentLevel: 'Entry Level',
      nextMilestone: 'Advanced Practitioner',
      recommendedCourses: courses,
      trendingSkillsToLearn: recommendedSkills.map(r => ({
        skillId: r.skillId,
        name: skillMap.get(r.skillId) ?? r.skillId,
        jobCount: r._count.skillId,
      })),
    };
  }

  async getSalaryBenchmark(roleKeyword: string) {
    const jobs = await this.prisma.job.findMany({
      where: {
        isActive: true,
        title: { contains: roleKeyword, mode: 'insensitive' },
        salaryMin: { not: null },
        salaryMax: { not: null },
      },
      select: { salaryMin: true, salaryMax: true },
    });

    if (!jobs.length) return { roleKeyword, count: 0, avgMin: null, avgMax: null, median: null };

    const mins = jobs.map(j => j.salaryMin!);
    const maxs = jobs.map(j => j.salaryMax!);
    const mids = jobs.map(j => Math.round((j.salaryMin! + j.salaryMax!) / 2)).sort((a, b) => a - b);
    const mid = Math.floor(mids.length / 2);
    const median = mids.length % 2 === 0 ? Math.round((mids[mid - 1] + mids[mid]) / 2) : mids[mid];

    return {
      roleKeyword,
      count: jobs.length,
      avgMin: Math.round(mins.reduce((a, b) => a + b, 0) / mins.length),
      avgMax: Math.round(maxs.reduce((a, b) => a + b, 0) / maxs.length),
      median,
    };
  }

  async getIndustryTrends() {
    const demand = await this.prisma.jobSkill.groupBy({
      by: ['skillId'],
      _count: { skillId: true },
      orderBy: { _count: { skillId: 'desc' } },
      take: 20,
    });

    const skills = await this.prisma.skill.findMany({
      where: { id: { in: demand.map(d => d.skillId) } },
      select: { id: true, name: true, tag: true },
    });
    const skillMap = new Map(skills.map(s => [s.id, s]));

    return demand.map(d => ({
      skillId: d.skillId,
      name: skillMap.get(d.skillId)?.name ?? d.skillId,
      tag: skillMap.get(d.skillId)?.tag ?? null,
      jobCount: d._count.skillId,
    }));
  }
}
