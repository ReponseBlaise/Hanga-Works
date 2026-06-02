import { IsIn, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { MediaPurpose } from '../storage.service';

const UPLOAD_PURPOSES: MediaPurpose[] = [
  'avatar',
  'course-thumbnail',
  'course-video',
  'course-document',
];

export class PresignUploadDto {
  @IsIn(UPLOAD_PURPOSES)
  purpose: MediaPurpose;

  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  contentType: string;

  @IsOptional()
  @IsUUID()
  courseId?: string;

  @IsOptional()
  @IsUUID()
  moduleId?: string;
}
