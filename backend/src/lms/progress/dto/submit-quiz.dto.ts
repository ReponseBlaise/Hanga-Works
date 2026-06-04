import { IsInt, Min, Max, IsString, IsNotEmpty } from 'class-validator';

export class SubmitQuizDto {
  @IsString()
  @IsNotEmpty()
  enrollmentId: string;

  @IsInt()
  @Min(0)
  @Max(100)
  score: number;
}
