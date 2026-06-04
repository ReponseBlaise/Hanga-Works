import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { AttachModuleMediaDto } from './dto/attach-module-media.dto';
import { CreateCourseTestDto, SubmitTestAttemptDto } from './dto/course-test.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../../auth/decorators/current-user.decorator';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get('manage')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'INSTITUTION', 'MENTOR')
  findAllManageable(@CurrentUser() user: CurrentUserPayload) {
    return this.coursesService.findAllManageable(user);
  }

  @Get(':id/modules/:moduleId/lesson')
  @UseGuards(OptionalJwtAuthGuard)
  getLesson(
    @Param('id') courseId: string,
    @Param('moduleId') moduleId: string,
    @CurrentUser() user: CurrentUserPayload | null,
  ) {
    return this.coursesService.getModuleLesson(
      courseId,
      moduleId,
      user ?? undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'INSTITUTION', 'MENTOR')
  create(
    @Body() dto: CreateCourseDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.create(dto, user);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'INSTITUTION', 'MENTOR')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.update(id, dto, user);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'INSTITUTION', 'MENTOR')
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.coursesService.remove(id, user);
  }

  @Post(':id/modules')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'INSTITUTION', 'MENTOR')
  addModule(
    @Param('id') courseId: string,
    @Body() dto: CreateModuleDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.addModule(courseId, dto, user);
  }

  @Patch(':id/modules/:moduleId/media')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'INSTITUTION', 'MENTOR')
  attachModuleMedia(
    @Param('id') courseId: string,
    @Param('moduleId') moduleId: string,
    @Body() dto: AttachModuleMediaDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.attachModuleMedia(
      courseId,
      moduleId,
      dto,
      user,
    );
  }

  @Patch(':id/modules/:moduleId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'INSTITUTION', 'MENTOR')
  updateModule(
    @Param('id') courseId: string,
    @Param('moduleId') moduleId: string,
    @Body() dto: UpdateModuleDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.updateModule(courseId, moduleId, dto, user);
  }

  @Delete(':id/modules/:moduleId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'INSTITUTION', 'MENTOR')
  removeModule(
    @Param('id') courseId: string,
    @Param('moduleId') moduleId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.removeModule(courseId, moduleId, user);
  }

  @Post(':id/test')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'INSTITUTION', 'MENTOR')
  @ApiOperation({ summary: 'Create or replace a test for a course' })
  @ApiResponse({ status: 201, description: 'Test created successfully' })
  createCourseTest(
    @Param('id') courseId: string,
    @Body() dto: CreateCourseTestDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.createCourseTest(courseId, dto, user);
  }

  @Get(':id/test')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get the test for a course (options are randomized, correct answers hidden)' })
  @ApiResponse({ status: 200, description: 'Returns the test questions' })
  getCourseTest(
    @Param('id') courseId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.getCourseTest(courseId, user);
  }

  @Post(':id/test/attempt')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('LEARNER')
  @ApiOperation({ summary: 'Submit answers for a course test' })
  @ApiResponse({ status: 201, description: 'Returns score and whether passed' })
  submitTestAttempt(
    @Param('id') courseId: string,
    @Body() dto: SubmitTestAttemptDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.submitTestAttempt(courseId, user.userId, dto);
  }
}
