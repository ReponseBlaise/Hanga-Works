import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';
import { CoursesModule } from './lms/courses/courses.module';
import { EnrollmentModule } from './lms/enrollment/enrollment.module';
import { ProgressModule } from './lms/progress/progress.module';
import { JobsModule } from './jobs/jobs.module';
import { CertificationsModule } from './certifications/certifications.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CoursesModule,
    EnrollmentModule,
    ProgressModule,
    JobsModule,
    CertificationsModule,
    AnalyticsModule,
    NotificationsModule,
    AuthModule,
  ],
  providers: [PrismaService, RedisService],
})
export class AppModule {}
