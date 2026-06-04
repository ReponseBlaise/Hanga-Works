import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApplicationStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStageDto {
  @ApiProperty({ example: 'INTERVIEWING', enum: ApplicationStatus, description: 'The new stage/status of the application' })
  @IsEnum(ApplicationStatus)
  @IsNotEmpty()
  status: ApplicationStatus;
}