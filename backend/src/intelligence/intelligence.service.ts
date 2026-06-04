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

    return {
      currentLevel: 'Entry Level',
      nextMilestone: 'Advanced Practitioner',
      recommendedCourses: courses,
      trendingSkillsToLearn: recommendedSkills.map((rs) => ({
        skillId: rs.skillId,
        skillName: skillMap.get(rs.skillId),
        _count: rs._count,
      })),
    };
  }

  async getSalaryBenchmark(role?: string) {
    const where = role ? { title: { contains: role, mode: 'insensitive' as const } } : {};

    const jobs = await this.prisma.job.findMany({
      where: { ...where, isActive: true, salaryMin: { not: null }, salaryMax: { not: null } },
      select: { title: true, salaryMin: true, salaryMax: true },
    });

    const grouped = new Map<string, { min: number[]; max: number[] }>();

    for (const job of jobs) {
      const key = job.title.toLowerCase().includes('frontend') ? 'Frontend Developer'
        : job.title.toLowerCase().includes('backend') ? 'Backend Developer'
        : job.title.toLowerCase().includes('full') ? 'Full Stack Developer'
        : 'Other';

      if (!grouped.has(key)) grouped.set(key, { min: [], max: [] });
      if (job.salaryMin) grouped.get(key)!.min.push(job.salaryMin);
      if (job.salaryMax) grouped.get(key)!.max.push(job.salaryMax);
    }

    return Array.from(grouped.entries()).map(([roleTitle, salaries]) => ({
      role: roleTitle,
      minSalary: Math.min(...salaries.min),
      maxSalary: Math.max(...salaries.max),
      jobCount: salaries.min.length,
    }));
  }

  async getIndustryTrends() {
    const demand = await this.prisma.jobSkill.groupBy({
      by: ['skillId'],
      where: { job: { isActive: true } },
      _count: { skillId: true },
      orderBy: { _count: { skillId: 'desc' } },
      take: 10,
    });

    const skillIds = demand.map((d) => d.skillId);
    const skills = await this.prisma.skill.findMany({
      where: { id: { in: skillIds } },
      select: { id: true, name: true },
    });

    const skillMap = new Map(skills.map((s) => [s.id, s.name]));

    const trends = await Promise.all(
      demand.map(async (d) => {
        const courses = await this.prisma.course.findMany({
          where: { published: true, skills: { some: { skillId: d.skillId } } },
          select: { id: true, title: true, slug: true },
          take: 3,
        });

        const jobs = await this.prisma.job.findMany({
          where: { isActive: true, skills: { some: { skillId: d.skillId } } },
          select: { id: true, title: true, slug: true, employer: { select: { name: true } } },
          take: 3,
        });

        return {
          skillId: d.skillId,
          skillName: skillMap.get(d.skillId) ?? 'Unknown Skill',
          jobCount: d._count.skillId,
          relatedCourses: courses,
          relatedJobs: jobs,
        };
      }),
    );

    return trends;
  }
}
