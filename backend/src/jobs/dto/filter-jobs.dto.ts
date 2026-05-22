import { IsOptional, IsEnum, IsString, IsUUID } from 'class-validator';
import { JobType } from '@prisma/client';

export class FilterJobsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(JobType)
  jobType?: JobType;

  @IsOptional()
  @IsUUID()
  skillId?: string;
}
