const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

async function main() {
  console.log("Generating 5 fresh Employer tokens...\n");
  for (let i = 1; i <= 5; i++) {
    const email = `employer_test_${i}_${Date.now()}@test.com`;
    // Create the user in the database so the token actually works for database relations
    const user = await prisma.user.create({
      data: {
        name: `Test Employer ${i}`,
        email: email,
        passwordHash: 'fakehash',
        role: 'EMPLOYER'
      }
    });

    // Generate a valid JWT for this user
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: 'EMPLOYER' },
      'secretKey',
      { expiresIn: '1d' }
    );

    console.log(`=== EMPLOYER ${i} ===`);
    console.log(`Email: ${user.email}`);
    console.log(`Bearer ${token}\n`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
