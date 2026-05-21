import { IsNotEmpty, IsString } from 'class-validator';

export class ValidateCertificateDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
