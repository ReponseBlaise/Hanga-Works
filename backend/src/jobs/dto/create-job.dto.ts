import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  IsArray,
  IsUUID,
  IsDateString,
  Min,
  MinLength,
} from 'class-validator';
import { JobType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateJobDto {
  @ApiProperty({ example: 'Senior Frontend Developer', description: 'The title of the job' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'senior-frontend-developer', description: 'Unique slug for the job URL' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'We are looking for an experienced frontend developer proficient in React and TypeScript.', description: 'Job description' })
  @IsString()
  @MinLength(20)
  description: string;

  @ApiProperty({ example: 'Kigali, Rwanda', required: false, description: 'Location of the job' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: 'FULL_TIME', enum: JobType, required: false, description: 'Type of employment' })
  @IsOptional()
  @IsEnum(JobType)
  jobType?: JobType;

  @ApiProperty({ example: 1000000, required: false, description: 'Minimum salary in RWF' })
  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMin?: number;

  @ApiProperty({ example: 2500000, required: false, description: 'Maximum salary in RWF' })
  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMax?: number;

  @ApiProperty({ example: '2027-12-31T23:59:59Z', required: false, description: 'Expiration date of the job posting' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiProperty({ example: ['uuid-skill-1', 'uuid-skill-2'], required: false, description: 'Array of skill IDs required for the job' })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  skillIds?: string[];
}
