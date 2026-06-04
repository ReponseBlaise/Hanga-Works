import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding admin user into Hanga database...');

  const passwordHash = await bcrypt.hash('adminpassword123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@hanga.com' },
    update: {
      passwordHash: passwordHash,
      role: 'ADMIN',
    },
    create: {
      name: 'Super Admin',
      email: 'admin@hanga.com',
      passwordHash: passwordHash,
      role: 'ADMIN',
    },
  });

  console.log('Created Admin User:', adminUser.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
