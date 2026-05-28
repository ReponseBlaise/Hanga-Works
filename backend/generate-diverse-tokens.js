const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

async function main() {
  console.log("Generating 5 fresh tokens with DIFFERENT ROLES...\n");
  const roles = ['LEARNER', 'EMPLOYER', 'INSTITUTION', 'MENTOR', 'ADMIN'];
  
  for (const role of roles) {
    const email = `${role.toLowerCase()}_${Date.now()}@test.com`;
    // Create the user in the database so the token actually works for database relations
    const user = await prisma.user.create({
      data: {
        name: `Test ${role}`,
        email: email,
        passwordHash: 'fakehash',
        role: role
      }
    });

    // Generate a valid JWT for this user
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: role },
      'secretKey',
      { expiresIn: '1d' }
    );

    console.log(`=== ${role} TOKEN ===`);
    console.log(`Email: ${user.email}`);
    console.log(`Bearer ${token}\n`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
