import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JobsService } from '../jobs/jobs.service';
import { CreateJobDto } from '../jobs/dto/create-job.dto';
import { FilterJobsDto } from '../jobs/dto/filter-jobs.dto';
import { UpdateApplicationStatusDto } from '../jobs/dto/update-application-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../auth/decorators/current-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller()
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // ── Jobs ─────────────────────────────────────────────────────────────────

  @Post('jobs')
  @UseGuards(JwtAuthGuard)
  createJob(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateJobDto,
  ) {
    return this.jobsService.createJob(user.userId, user.role, dto);
  }

  @Get('jobs')
  findAll(@Query() filters: FilterJobsDto) {
    return this.jobsService.findAll(filters);
  }

  @Get('jobs/recommended')
  @UseGuards(JwtAuthGuard)
  getRecommended(@CurrentUser() user: CurrentUserPayload) {
    return this.jobsService.getRecommended(user.userId);
  }

  @Get('jobs/:id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Post('jobs/:id/apply')
  @UseGuards(JwtAuthGuard)
  apply(
    @Param('id') jobId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.jobsService.apply(jobId, user.userId, user.role);
  }

  // ── Applications ──────────────────────────────────────────────────────────

  @Get('applications')
  @UseGuards(JwtAuthGuard)
  getApplications(@CurrentUser() user: CurrentUserPayload) {
    return this.jobsService.getApplications(user.userId, user.role);
  }

  @Patch('applications/:id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(
    @Param('id') applicationId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.jobsService.updateApplicationStatus(
      applicationId,
      user.userId,
      user.role,
      dto,
    );
  }
}
