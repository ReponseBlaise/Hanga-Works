import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsUrl,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ example: 'Introduction to Web Development', description: 'The title of the course' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'intro-to-web-dev', description: 'Unique slug for the course URL' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'Learn the basics of HTML, CSS, and JavaScript in this comprehensive beginner course.', description: 'Course description' })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ example: true, required: false, description: 'Whether the course is publicly visible' })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiProperty({ example: 'https://res.cloudinary.com/demo/image/upload/v1/course-thumbnail.jpg', required: false, description: 'URL for the course thumbnail image' })
  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string;

  @ApiProperty({ example: 'uuid-institution-1234', required: false, description: 'ID of the institution offering the course' })
  @IsOptional()
  @IsString()
  institutionId?: string;
}
