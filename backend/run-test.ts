import { PrismaClient } from '@prisma/client';
import { NotificationService } from './src/services/notification.service';

const prisma = new PrismaClient();

async function runTests() {
  console.log('🚀 Starting Automated Notification Tests...\n');

  // 1. Create a mock user
  const user = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test Learner'
  };

  // 2. Test Registration Notification
  console.log('--- TESTING REGISTRATION NOTIFICATION ---');
  await NotificationService.sendRegistrationConfirmation(user);
  
  // 3. Test Job Match Notification
  console.log('\n--- TESTING JOB MATCH NOTIFICATION ---');
  await NotificationService.sendJobMatchAlert(user, 'Senior Full Stack Developer', 'KLab Rwanda');

  // 4. Test Application Status
  console.log('\n--- TESTING APPLICATION STATUS NOTIFICATION ---');
  await NotificationService.sendApplicationStatusUpdate(user, 'Senior Full Stack Developer', 'HIRED');

  // 5. Test Course Completion & Certificate
  console.log('\n--- TESTING COURSE COMPLETION & CERTIFICATE ---');
  await NotificationService.sendCourseCompletion(user, 'Advanced React Patterns');
  await NotificationService.sendCertificateIssued(user, 'Advanced React Patterns Certificate', 'http://localhost:5001/api/v1/certificates/cert-123');

  console.log('\n✅ All notification tests completed successfully!');
}

runTests()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
