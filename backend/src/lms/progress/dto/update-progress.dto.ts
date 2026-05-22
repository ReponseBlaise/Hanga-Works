import { IsInt, Min, Max, IsEnum, IsOptional } from 'class-validator';
import { EnrollmentStatus } from '@prisma/client';

export class UpdateProgressDto {
  @IsInt()
  @Min(0)
  @Max(100)
  progress: number;

  @IsOptional()
  @IsEnum(EnrollmentStatus)
  status?: EnrollmentStatus;
}
