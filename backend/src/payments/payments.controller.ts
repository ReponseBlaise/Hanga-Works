import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('verify')
  @ApiOperation({ summary: 'Verify a Flutterwave transaction and enroll the user in the course' })
  verify(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: VerifyPaymentDto,
  ) {
    return this.paymentsService.verifyAndEnroll(user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List my payment history' })
  getMyPayments(@CurrentUser() user: CurrentUserPayload) {
    return this.paymentsService.getMyPayments(user.userId);
  }
}
