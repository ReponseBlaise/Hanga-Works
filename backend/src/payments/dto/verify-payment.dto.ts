import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyPaymentDto {
  @ApiProperty({ example: 'hw-course-id-user-id-1234567890-0' })
  @IsString()
  @IsNotEmpty()
  txRef: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @ApiProperty({ example: 'course-uuid-here' })
  @IsString()
  @IsNotEmpty()
  courseId: string;
}
