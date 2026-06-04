import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.upsert({
    where: { slug: 'test-course-101' },
    update: {},
    create: {
      title: 'Introduction to Testing',
      slug: 'test-course-101',
      description: 'A course to test the enrollment API',
      published: true
    }
  });

  console.log('Successfully seeded course with ID:');
  console.log(course.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
