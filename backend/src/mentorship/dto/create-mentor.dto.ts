import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateMentorDto {
  @IsString()
  expertise: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsInt()
  hourlyRate?: number;

  @IsOptional()
  @IsString()
  availability?: string;
}
