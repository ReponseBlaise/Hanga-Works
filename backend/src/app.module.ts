import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';
import { CoursesModule } from './lms/courses/courses.module';
import { EnrollmentModule } from './lms/enrollment/enrollment.module';
import { ProgressModule } from './lms/progress/progress.module';
import { JobsModule } from './jobs/jobs.module';
import { CertificationsModule } from './certifications/certifications.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { NotificationsModule } from './notifications/notifications.module';
import { EmployerModule } from './employer/employer.module';
import { MentorshipModule } from './mentorship/mentorship.module';
import { IntelligenceModule } from './intelligence/intelligence.module';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { StorageModule } from './storage/storage.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    StorageModule,
    ThrottlerModule.forRoot([{
      ttl: 900000, // 15 minutes in milliseconds
      limit: 100, // 100 requests per 15 minutes
    }]),
    CoursesModule,
    EnrollmentModule,
    ProgressModule,
    JobsModule,
    CertificationsModule,
    AnalyticsModule,
    NotificationsModule,
    AuthModule,
    UsersModule,
    EmployerModule,
    MentorshipModule,
    IntelligenceModule,
    AdminModule,
  ],
  providers: [
    PrismaService, 
    RedisService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
