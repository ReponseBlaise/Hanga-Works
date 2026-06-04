import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'student@ur.ac.rw', description: 'The email address of the user' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'leo@ABC2025!!', description: 'The password of the user' })
  @IsString()
  @IsNotEmpty()
  password: string;
}