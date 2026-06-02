import { IsOptional, IsEnum, IsString, IsUUID, IsInt, Min, IsArray, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';
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

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @Transform(({ value }) => {
    if (!value) return undefined;
    // support comma-separated string from query params
    if (typeof value === 'string') return value.split(',').map((v) => v.trim()).filter(Boolean);
    return value;
  })
  skillIds?: string[];

  @IsOptional()
  @IsIn(['any', 'all'])
  skillMatch?: 'any' | 'all';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  salaryMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  salaryMax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  perPage?: number;
}
