import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'student@ur.ac.rw', description: 'Email address of the user' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+250781234567', description: 'Phone number (optional)', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'leo@ABC2025!!', description: 'Password (min 6 characters)' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'LEARNER', enum: Role, required: false, description: 'Role of the user (LEARNER, EMPLOYER, INSTITUTION, MENTOR)' })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiProperty({ type: 'string', format: 'binary', required: false, description: 'Certificate file for Employer/Institution' })
  @IsOptional()
  certificate?: unknown;
}