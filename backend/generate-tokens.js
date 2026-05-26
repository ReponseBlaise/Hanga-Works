const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

async function main() {
  const employer = await prisma.user.findFirst({ where: { role: 'EMPLOYER' } });
  const learner = await prisma.user.findFirst({ where: { role: 'LEARNER' } });

  console.log("=== EMPLOYER TOKEN ===");
  if (employer) {
    const empToken = jwt.sign(
      { sub: employer.id, email: employer.email, role: 'EMPLOYER' },
      'secretKey',
      { expiresIn: '1d' }
    );
    console.log(`Email: ${employer.email}`);
    console.log(`Bearer ${empToken}\n`);
  } else {
    console.log("No employer found in DB.\n");
  }

  console.log("=== LEARNER TOKEN ===");
  if (learner) {
    const learnerToken = jwt.sign(
      { sub: learner.id, email: learner.email, role: 'LEARNER' },
      'secretKey',
      { expiresIn: '1d' }
    );
    console.log(`Email: ${learner.email}`);
    console.log(`Bearer ${learnerToken}\n`);
  } else {
    console.log("No learner found in DB.\n");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
