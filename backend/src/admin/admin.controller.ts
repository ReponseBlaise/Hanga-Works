import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AccountStatus } from '@prisma/client';

@Controller('admin/moderation')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  getUsers() {
    return this.adminService.getUsers();
  }

  @Get('users/:id')
  getUserDetail(@Param('id') id: string) {
    return this.adminService.getUserDetail(id);
  }

  @Patch('users/:id/status')
  updateUserStatus(
    @Param('id') id: string,
    @Body('status') status: AccountStatus,
  ) {
    return this.adminService.updateUserStatus(id, status);
  }

  @Get('jobs')
  getJobs() {
    return this.adminService.getJobs();
  }

  @Patch('jobs/:id/status')
  updateJobStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.adminService.updateJobStatus(id, isActive);
  }

  @Get('courses')
  getCourses() {
    return this.adminService.getCourses();
  }

  @Patch('courses/:id/status')
  updateCourseStatus(
    @Param('id') id: string,
    @Body('published') published: boolean,
  ) {
    return this.adminService.updateCourseStatus(id, published);
  }
}
