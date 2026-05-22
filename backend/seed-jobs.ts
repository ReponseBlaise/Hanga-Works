import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding database...');

  // 1. Create a mock Employer User
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  const employerUser = await prisma.user.upsert({
    where: { email: 'hr@techcorp.com' },
    update: {},
    create: {
      name: 'Tech Corp HR',
      email: 'hr@techcorp.com',
      password: passwordHash, // raw password for auth
      role: 'EMPLOYER',
    }
  });

  // 2. Create Organization
  const org = await prisma.organization.create({
    data: {
      name: 'Tech Corp Inc',
      type: 'EMPLOYER',
      website: 'https://techcorp.com'
    }
  });

  // Link User to Org
  await prisma.user.update({
    where: { id: employerUser.id },
    data: { organizationId: org.id }
  });

  // 3. Create Jobs
  const jobs = [
    {
      title: 'Junior Frontend Developer',
      slug: 'junior-frontend-dev-' + Date.now(),
      description: 'Looking for a React developer to join our growing team.',
      location: 'Kigali, Rwanda',
      jobType: 'FULL_TIME' as const,
      salaryMin: 500,
      salaryMax: 1200,
      employerId: org.id
    },
    {
      title: 'Senior Backend Engineer',
      slug: 'senior-backend-engineer-' + Date.now(),
      description: 'Node.js and Express expert needed for high-scale microservices.',
      location: 'Remote',
      jobType: 'REMOTE' as const,
      salaryMin: 2000,
      salaryMax: 4500,
      employerId: org.id
    },
    {
      title: 'UI/UX Designer',
      slug: 'ui-ux-designer-' + Date.now(),
      description: 'Design beautiful interfaces for our workforce intelligence platform.',
      location: 'Kigali, Rwanda',
      jobType: 'PART_TIME' as const,
      salaryMin: 800,
      salaryMax: 1500,
      employerId: org.id
    }
  ];

  for (const job of jobs) {
    await prisma.job.create({ data: job });
  }

  console.log('✅ Successfully seeded 1 Employer and 3 Jobs!');
}

seed()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
