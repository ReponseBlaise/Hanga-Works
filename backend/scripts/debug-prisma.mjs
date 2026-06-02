import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

try {
  const demand = await p.jobSkill.groupBy({
    by: ['skillId'],
    _count: { skillId: true },
    orderBy: { _count: { skillId: 'desc' } },
    take: 10,
  });
  console.log('groupBy OK', demand.length);
} catch (e) {
  console.error('groupBy ERR', e.message);
}

try {
  const org = await p.organization.findFirst({ where: { type: 'EMPLOYER' } });
  const job = await p.job.create({
    data: {
      title: 'Debug Job',
      description: 'A long enough description for validation.',
      slug: `debug-${Date.now()}`,
      employerId: org.id,
      jobType: 'FULL_TIME',
    },
  });
  console.log('job OK', job.id);
  await p.job.delete({ where: { id: job.id } });
} catch (e) {
  console.error('job ERR', e.message);
}

await p.$disconnect();
