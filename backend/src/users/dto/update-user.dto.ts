import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { ProficiencyLevel } from '@prisma/client';

export class UserSkillDto {
  @IsString()
  skillName: string;

  @IsEnum(ProficiencyLevel)
  level: ProficiencyLevel;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsArray()
  skills?: UserSkillDto[];
}
