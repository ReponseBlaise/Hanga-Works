require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { id: '1724e400-7fa2-430e-9aca-5d245f394628' },
    select: { id: true, name: true, email: true, role: true },
  });

  const courses = await prisma.course.findMany({
    take: 5,
    select: { id: true, title: true },
  });

  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' },
  );

  console.log('\n====== SOPHIE JWT ======');
  console.log(token);
  console.log('\n====== AVAILABLE COURSES ======');
  console.log(JSON.stringify(courses, null, 2));

  await prisma.$disconnect();
}

main();
