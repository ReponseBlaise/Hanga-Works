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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { AttachModuleMediaDto } from './dto/attach-module-media.dto';
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
  @Roles('ADMIN', 'INSTITUTION')
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
  @Roles('ADMIN', 'INSTITUTION')
  create(
    @Body() dto: CreateCourseDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.create(dto, user);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'INSTITUTION')
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
  @Roles('ADMIN', 'INSTITUTION')
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.coursesService.remove(id, user);
  }

  @Post(':id/modules')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'INSTITUTION')
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
  @Roles('ADMIN', 'INSTITUTION')
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
  @Roles('ADMIN', 'INSTITUTION')
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
  @Roles('ADMIN', 'INSTITUTION')
  removeModule(
    @Param('id') courseId: string,
    @Param('moduleId') moduleId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.removeModule(courseId, moduleId, user);
  }
}
