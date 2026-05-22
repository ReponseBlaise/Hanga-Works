import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { CertificationsController } from './certifications.controller';
import { CertificationsService } from './certifications.service';
import { PdfService } from './pdf.service';
import { StorageService } from './storage.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'changeme',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [CertificationsController],
  providers: [CertificationsService, PdfService, StorageService, PrismaService, JwtStrategy],
  exports: [CertificationsService],
})
export class CertificationsModule {}
