import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { MediaPurpose } from '../storage.service';

const PURPOSES: MediaPurpose[] = [
  'avatar',
  'course-thumbnail',
  'course-video',
  'course-document',
];

export class UploadMediaQueryDto {
  @IsIn(PURPOSES)
  purpose: MediaPurpose;

  @IsOptional()
  @IsUUID()
  courseId?: string;

  @IsOptional()
  @IsUUID()
  moduleId?: string;
}
