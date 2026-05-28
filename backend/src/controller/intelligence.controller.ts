import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { IntelligenceService } from '../intelligence/intelligence.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('intelligence')
export class IntelligenceController {
  constructor(private readonly intelligenceService: IntelligenceService) {}

  @Get('gap-analysis')
  async getGapAnalysis(
    @Request() req: { user: { userId: string } },
    @Query('jobId') jobId: string,
  ) {
    return this.intelligenceService.getSkillGapAnalysis(req.user.userId, jobId);
  }

  @Get('pathway')
  async getPathway(@Request() req: { user: { userId: string } }) {
    return this.intelligenceService.getCareerPathway(req.user.userId);
  }
}
