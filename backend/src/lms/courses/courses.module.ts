import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { JwtStrategy } from '../../auth/strategies/jwt.strategy';
import { CertificationsService } from '../../certifications/certifications.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { PdfService } from '../../certifications/pdf.service';
import { StorageService } from '../../storage/storage.service';
import { NotificationsGateway } from '../../notifications/notifications.gateway';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'changeme',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [CoursesController],
  providers: [CoursesService, PrismaService, RedisService, JwtStrategy, CertificationsService, NotificationsService, PdfService, StorageService, NotificationsGateway],
  exports: [CoursesService],
})
export class CoursesModule {}
