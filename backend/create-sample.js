const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

async function main() {
  // 1. Create Employer User
  const employerEmail = `boss${Date.now()}@test.com`;
  const employer = await prisma.user.create({
    data: { name: "Big Boss", email: employerEmail, passwordHash: "hashed", role: "EMPLOYER" }
  });

  // 2. Create Organization
  const org = await prisma.organization.create({
    data: { name: "Sample Company", type: "EMPLOYER" }
  });
  
  // Link User to Org
  await prisma.user.update({ where: { id: employer.id }, data: { organizationId: org.id } });

  // 3. Create Job
  const job = await prisma.job.create({
    data: { title: "Sample Job", slug: `sample-job-${Date.now()}`, description: "Testing", employerId: org.id }
  });

  // 4. Create Learner & Application
  const learner = await prisma.user.create({
    data: { name: "Applicant Joe", email: `joe${Date.now()}@test.com`, passwordHash: "hashed", role: "LEARNER" }
  });

  const app = await prisma.application.create({
    data: { userId: learner.id, jobId: job.id }
  });

  // 5. Generate Token
  const token = jwt.sign(
    { userId: employer.id, email: employer.email, role: "EMPLOYER" },
    process.env.JWT_SECRET || 'super-secret-fallback',
    { expiresIn: '1d' }
  );

  console.log("---");
  console.log("TOKEN:", token);
  console.log("JOB_ID:", job.id);
  console.log("APP_ID:", app.id);
  console.log("---");
}

main().catch(console.error).finally(() => prisma.$disconnect());
