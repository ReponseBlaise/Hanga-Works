import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ApplyJobDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  coverLetter?: string;
}
