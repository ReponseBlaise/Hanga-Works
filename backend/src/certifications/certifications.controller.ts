import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
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
}
