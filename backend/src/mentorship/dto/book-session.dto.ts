import { IsString, IsDateString, IsOptional, IsInt } from 'class-validator';

export class BookSessionDto {
  @IsString()
  mentorId: string;

  @IsDateString()
  scheduledAt: string;

  @IsOptional()
  @IsInt()
  durationMinutes?: number;
}
