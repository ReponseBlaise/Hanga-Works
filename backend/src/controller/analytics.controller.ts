import { BadRequestException, Controller, ForbiddenException, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { Role } from '@prisma/client';
import { AnalyticsService } from '../analytics/analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  getOverview(@CurrentUser() user: CurrentUserPayload) {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can view analytics');
    }
    return this.analyticsService.getOverview();
  }

  @Get('export')
  async exportCsv(
    @Query('format') format: string,
    @CurrentUser() user: CurrentUserPayload,
    @Res() res: Response,
  ) {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can export analytics');
    }

    if (format !== 'csv') throw new BadRequestException('Supported formats: csv');

    const csv = await this.analyticsService.exportCsv();
    const date = new Date().toISOString().split('T')[0];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="analytics-${date}.csv"`);
    res.send(csv);
  }
}
