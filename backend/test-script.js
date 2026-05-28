const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findUnique({
      where: { email: 'alice.uwimana@email.rw' },
      select: {
        id: true,
        skills: {
          select: {
            skill: true,
            level: true,
          },
        },
      },
    }).then(console.log).catch(e => console.log('ERROR:', e.message)).finally(() => prisma.$disconnect());
