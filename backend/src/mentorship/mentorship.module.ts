import { Module } from '@nestjs/common';
import { MentorshipService } from './mentorship.service';
import { MentorshipController } from '../controller/mentorship.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [MentorshipController],
  providers: [MentorshipService, PrismaService],
  exports: [MentorshipService],
})
export class MentorshipModule {}
