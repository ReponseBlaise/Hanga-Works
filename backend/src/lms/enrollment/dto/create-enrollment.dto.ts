import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateEnrollmentDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  courseId: string;
}
