import { Body, Controller, Get, Param, Post, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { CertificationsService } from './certifications.service';
import { ValidateCertificateDto } from './dto/validate-certificate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../auth/decorators/current-user.decorator';

@Controller('certificates')
export class CertificationsController {
  constructor(private readonly service: CertificationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getMyCertificates(@CurrentUser() user: CurrentUserPayload) {
    return this.service.getMyCertificates(user.userId);
  }

  @Get('verify/:token')
  verify(@Param('token') token: string) {
    return this.service.verify(token);
  }

  @Post('validate')
  @UseGuards(JwtAuthGuard)
  validate(
    @Body() dto: ValidateCertificateDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.service.validate(dto.token, user.userId, user.role);
  }

  @Get(':code/download')
  async downloadPdf(@Param('code') code: string, @Res() res: Response) {
    const buffer = await this.service.generatePdfFor(code);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="certificate-${code}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }
}
