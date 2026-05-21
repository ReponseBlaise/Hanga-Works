import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
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
  controllers: [ProgressController],
  providers: [ProgressService, PrismaService, JwtStrategy],
})
export class ProgressModule {}
