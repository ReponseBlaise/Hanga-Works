import { Controller, Post, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { EmployerService } from './employer.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('EMPLOYER')
@Controller('employer')
export class EmployerController {
  constructor(private readonly employerService: EmployerService) {}

  @Post('jobs')
  async createJob(@CurrentUser() user: any, @Body() dto: CreateJobDto) {
    return this.employerService.createJob(user.userId, user.name || 'Employer', dto);
  }

  @Get('jobs/:id/applicants')
  async getApplicants(@CurrentUser() user: any, @Param('id') jobId: string) {
    return this.employerService.getApplicants(user.userId, jobId);
  }

  @Patch('applications/:id/stage')
  async updateStage(
    @CurrentUser() user: any,
    @Param('id') applicationId: string,
    @Body() dto: UpdateStageDto
  ) {
    return this.employerService.updateStage(user.userId, applicationId, dto);
  }

  @Get('analytics')
  async getAnalytics(@CurrentUser() user: any) {
    return this.employerService.getAnalytics(user.userId);
  }
}