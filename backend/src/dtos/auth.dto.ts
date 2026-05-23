import { IsString, IsEmail, MinLength, IsOptional, IsIn, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  name!: string;

  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password!: string;

  @IsOptional()
  @IsString()
  @IsIn(['LEARNER', 'EMPLOYER', 'INSTITUTION', 'MENTOR', 'ADMIN'])
  role?: string;
}

export class LoginDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1, { message: 'Password is required' })
  password!: string;
}

export class ForgotPasswordDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;
}

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  token!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  newPassword!: string;
}
