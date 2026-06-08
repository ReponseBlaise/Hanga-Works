import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'student@ur.ac.rw' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+250781234567', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'LEARNER', required: false })
  @IsOptional()
  @IsIn(['LEARNER', 'EMPLOYER', 'INSTITUTION', 'MENTOR'])
  role?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  certificate?: unknown;
}