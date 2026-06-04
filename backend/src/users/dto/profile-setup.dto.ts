import { IsOptional, IsString } from 'class-validator';

/** Extended profile fields for onboarding (PATCH /users/me also accepts these). */
export class ProfileSetupDto {
  @IsOptional()
  @IsString()
  phone?: string;
}
