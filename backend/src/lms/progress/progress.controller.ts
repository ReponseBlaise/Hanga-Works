import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../auth/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  // PATCH /progress/:enrollmentId
  @Patch('progress/:enrollmentId')
  updateProgress(
    @Param('enrollmentId') enrollmentId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.progressService.updateProgress(enrollmentId, user.userId, dto);
  }

  // GET /progress
  @Get('progress')
  getMyProgress(@CurrentUser() user: CurrentUserPayload) {
    return this.progressService.getProgress(user.userId);
  }

  // POST /quiz/:moduleId/submit
  @Post('quiz/:moduleId/submit')
  submitQuiz(
    @Param('moduleId') moduleId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: SubmitQuizDto,
  ) {
    return this.progressService.submitQuiz(moduleId, user.userId, dto);
  }
}
