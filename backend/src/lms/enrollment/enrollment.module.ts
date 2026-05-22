import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { EnrollmentController } from './enrollment.controller';
import { EnrollmentService } from './enrollment.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtStrategy } from '../../auth/strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'changeme',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [EnrollmentController],
  providers: [EnrollmentService, PrismaService, JwtStrategy],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}
