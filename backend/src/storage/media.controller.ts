import {
  Body,
  Controller,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../auth/decorators/current-user.decorator';
import { MediaUploadService } from './media-upload.service';
import { PresignUploadDto } from './dto/presign-upload.dto';
import { UploadMediaQueryDto } from './dto/upload-media-query.dto';

@ApiTags('media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('media')
export class MediaController {
  constructor(private readonly mediaUpload: MediaUploadService) {}

  /**
   * Multipart upload — profile & course assets go to Cloudinary when configured.
   * Form fields: file (required), purpose, courseId?, moduleId?
   */
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        purpose: { type: 'string' },
        courseId: { type: 'string' },
        moduleId: { type: 'string' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 200 * 1024 * 1024 },
    }),
  )
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Query() query: UploadMediaQueryDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.mediaUpload.uploadFile({
      purpose: query.purpose,
      file,
      user,
      courseId: query.courseId,
      moduleId: query.moduleId,
    });
  }

  /** Signed params for browser → Cloudinary direct upload (preferred for large videos). */
  @Post('cloudinary/sign')
  cloudinarySign(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: PresignUploadDto,
  ) {
    return this.mediaUpload.createUploadSignature({
      purpose: dto.purpose,
      user,
      courseId: dto.courseId,
      moduleId: dto.moduleId,
      fileName: dto.fileName,
      contentType: dto.contentType,
    });
  }

  /** Legacy S3 presign — used when Cloudinary is not set (course assets only). */
  @Post('presign')
  presign(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: PresignUploadDto,
  ) {
    return this.mediaUpload.createUploadSignature({
      purpose: dto.purpose,
      user,
      courseId: dto.courseId,
      moduleId: dto.moduleId,
      fileName: dto.fileName,
      contentType: dto.contentType,
    });
  }

  @Post('presign/course-asset')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INSTITUTION', 'MENTOR')
  presignCourseAsset(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: PresignUploadDto,
  ) {
    return this.mediaUpload.createUploadSignature({
      purpose: dto.purpose,
      user,
      courseId: dto.courseId,
      moduleId: dto.moduleId,
      fileName: dto.fileName,
      contentType: dto.contentType,
    });
  }
}
