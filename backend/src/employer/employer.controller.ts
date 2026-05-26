import { Controller, Post, Get, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { EmployerService } from './employer.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('EMPLOYER')
@Controller('employer')
export class EmployerController {
  constructor(private readonly employerService: EmployerService) {}

  @Post('jobs')
  async createJob(@Body() createJobDto: CreateJobDto, @Request() req: { user: { userId: string, role: string } }) {
    return this.employerService.createJob(req.user.userId, createJobDto);
  }

  @Get('jobs/:id/applicants')
  async getApplicants(@Param('id') jobId: string, @Request() req: { user: { userId: string, role: string } }) {
    return this.employerService.getApplicants(req.user.userId, jobId);
  }

  @Patch('applications/:id/stage')
  async updateApplicationStage(
    @Param('id') applicationId: string,
    @Body() updateStageDto: UpdateStageDto,
    @Request() req: { user: { userId: string, role: string } }
  ) {
    return this.employerService.updateStage(req.user.userId, applicationId, updateStageDto);
  }

  @Get('analytics')
  async getAnalytics(@Request() req: { user: { userId: string, role: string } }) {
    return this.employerService.getAnalytics(req.user.userId);
  }
}