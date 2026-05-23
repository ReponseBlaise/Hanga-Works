import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateJobDto {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  requirements?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  jobType?: string;

  @IsOptional()
  salaryMin?: string | number;

  @IsOptional()
  salaryMax?: string | number;
}
