import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';
import { CoursesModule } from './lms/courses/courses.module';
import { EnrollmentModule } from './lms/enrollment/enrollment.module';
import { ProgressModule } from './lms/progress/progress.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CoursesModule,
    EnrollmentModule,
    ProgressModule,
  ],
  providers: [PrismaService, RedisService],
})
export class AppModule {}
