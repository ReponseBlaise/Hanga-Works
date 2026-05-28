import { Module } from '@nestjs/common';
import { IntelligenceService } from './intelligence.service';
import { IntelligenceController } from '../controller/intelligence.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [IntelligenceController],
  providers: [IntelligenceService, PrismaService],
  exports: [IntelligenceService],
})
export class IntelligenceModule {}
