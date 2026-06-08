import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsUrl,
  Min,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ example: 'Introduction to Web Development' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'intro-to-web-dev' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'Learn the basics of HTML, CSS, and JavaScript.' })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsUrl({}, { message: 'thumbnailUrl must be a valid URL' })
  thumbnailUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsString()
  institutionId?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @ApiProperty({ required: false, example: 5000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({ required: false, example: 'RWF' })
  @IsOptional()
  @IsString()
  currency?: string;
}
