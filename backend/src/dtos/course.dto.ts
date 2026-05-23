import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class EnrollCourseDto {
  @IsNotEmpty()
  @IsString()
  courseId!: string;
}

export class UpdateProgressDto {
  @IsNotEmpty()
  @IsString()
  enrollmentId!: string;

  @IsNotEmpty()
  @IsString()
  lessonId!: string;

  @IsNotEmpty()
  @IsBoolean()
  completed!: boolean;
}

export class LessonDto {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  duration?: string;
}

export class ModuleDto {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LessonDto)
  lessons!: LessonDto[];
}

export class CreateCourseDto {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsNotEmpty()
  @IsString()
  level!: string;

  @IsNotEmpty()
  @IsString()
  duration!: string;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModuleDto)
  modules?: ModuleDto[];
}
