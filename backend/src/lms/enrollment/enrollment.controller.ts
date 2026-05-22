import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../auth/decorators/current-user.decorator';

@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  enroll(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateEnrollmentDto,
  ) {
    return this.enrollmentService.enroll(user.userId, dto);
  }

  @Get()
  findMy(@CurrentUser() user: CurrentUserPayload) {
    return this.enrollmentService.findByUser(user.userId);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ) {
    return this.enrollmentService.findOne(id, user.userId);
  }
}
