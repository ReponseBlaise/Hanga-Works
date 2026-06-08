import { IsInt, Min, Max, IsEnum, IsOptional, IsUUID, ValidateIf } from 'class-validator';
import { EnrollmentStatus } from '@prisma/client';

export class UpdateProgressDto {
  @ValidateIf((dto: UpdateProgressDto) => !dto.lastModuleId)
  @IsInt()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  @IsUUID()
  lastModuleId?: string;

  @IsOptional()
  @IsEnum(EnrollmentStatus)
  status?: EnrollmentStatus;
}
