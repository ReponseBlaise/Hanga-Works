import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);
  
  const user1 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      name: 'Alice Learner',
      email: 'alice@example.com',
      passwordHash,
      role: 'LEARNER'
    }
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      name: 'Bob Admin',
      email: 'bob@example.com',
      passwordHash,
      role: 'ADMIN'
    }
  });

  console.log('Successfully registered two users:');
  console.log(user1.email);
  console.log(user2.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
