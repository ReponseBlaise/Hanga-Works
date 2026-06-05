import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { ProficiencyLevel } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UserSkillDto {
  @ApiProperty({ example: 'JavaScript', description: 'Name of the skill' })
  @IsString()
  skillName: string;

  @ApiProperty({ example: 'INTERMEDIATE', enum: ProficiencyLevel, description: 'Proficiency level' })
  @IsEnum(ProficiencyLevel)
  level: ProficiencyLevel;
}

export class UpdateUserDto {
  @ApiProperty({ example: 'John Doe', required: false, description: 'Full name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'I am a passionate software developer.', required: false, description: 'User biography' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/demo/image/upload/v1/profile.jpg', required: false, description: 'Profile picture URL' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({ example: 'Kigali, Rwanda', required: false, description: 'User location' })
  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  headline?: string;

  @ApiProperty({ example: '+250781234567', required: false, description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ type: [UserSkillDto], required: false, description: 'List of user skills' })
  @IsOptional()
  @IsArray()
  skills?: UserSkillDto[];
}
