import { IsIn, IsOptional, IsString, IsUrl } from 'class-validator';

export class AttachModuleMediaDto {
  @IsIn(['video', 'notes', 'document'])
  mediaType: 'video' | 'notes' | 'document';

  /** Public URL returned from POST /media/presign after upload completes */
  @IsOptional()
  @IsUrl()
  publicUrl?: string;

  /** Lesson notes (markdown or plain text). Used when mediaType is notes. */
  @IsOptional()
  @IsString()
  notes?: string;
}
