import { IsString, IsNotEmpty, IsOptional, IsInt, IsEnum } from 'class-validator';
import { JobType } from '@prisma/client';

export class CreateJobDto {
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsNotEmpty() description: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsEnum(JobType) jobType?: JobType;
  @IsOptional() @IsInt() salaryMin?: number;
  @IsOptional() @IsInt() salaryMax?: number;
}