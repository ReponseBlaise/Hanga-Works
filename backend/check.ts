import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function test() {
  const user = await prisma.user.findUnique({ where: { email: 'admin@hanga.com' } });
  console.log('USER:', user ? user.email : null);
  if (user) {
    const isMatch = await bcrypt.compare('adminpassword123', user.passwordHash);
    console.log('PASSWORD MATCH:', isMatch);
  }
}

test().finally(async () => {
  await prisma.$disconnect();
});
