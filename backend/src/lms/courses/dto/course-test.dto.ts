import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TestOptionDto {
  @ApiProperty({ example: 'Hyper Text Markup Language' })
  @IsString()
  text: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isCorrect: boolean;
}

export class TestQuestionDto {
  @ApiProperty({ example: 'What does HTML stand for?' })
  @IsString()
  question: string;

  @ApiProperty({ type: [TestOptionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestOptionDto)
  options: TestOptionDto[];
}

export class CreateCourseTestDto {
  @ApiProperty({ example: 'Please answer all questions carefully. You need 80% to pass.' })
  @IsString()
  @IsOptional()
  instructions?: string;

  @ApiProperty({ example: 80 })
  @IsNumber()
  @IsOptional()
  passingScore?: number;

  @ApiProperty({ type: [TestQuestionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestQuestionDto)
  questions: TestQuestionDto[];
}

export class SubmitTestAttemptDto {
  @ApiProperty({
    description: 'Object mapping Question ID to the selected Option ID',
    example: { 'q-1': 'opt-2', 'q-2': 'opt-1' }
  })
  answers: Record<string, string>;
}
