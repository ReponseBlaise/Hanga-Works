import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class ApplyJobDto {
  @IsNotEmpty()
  @IsString()
  jobId!: string;
}

export class UpdateApplicationStatusDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['APPLIED', 'REVIEWING', 'SHORTLISTED', 'HIRED', 'REJECTED'])
  stage!: string;
}
