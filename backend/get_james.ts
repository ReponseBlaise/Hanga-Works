import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      name: {
        contains: 'james',
        mode: 'insensitive',
      },
    },
    include: {
      skills: {
        include: { skill: true }
      }
    }
  });

  if (users.length === 0) {
    console.log("No user found with the name James.");
  } else {
    console.log(JSON.stringify(users, null, 2));
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
