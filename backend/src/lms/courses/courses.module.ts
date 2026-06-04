import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { JwtStrategy } from '../../auth/strategies/jwt.strategy';
import { CertificationsModule } from '../../certifications/certifications.module';
import { NotificationsModule } from '../../notifications/notifications.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'changeme',
      signOptions: { expiresIn: '1d' },
    }),
    CertificationsModule,
    NotificationsModule,
  ],
  controllers: [CoursesController],
  providers: [
    CoursesService,
    PrismaService,
    RedisService,
    JwtStrategy,
  ],
  exports: [CoursesService],
})
export class CoursesModule {}
