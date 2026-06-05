import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

interface FlutterwaveVerifyResponse {
  status: string;
  message: string;
  data?: {
    id: number;
    status: string;
    tx_ref: string;
    amount: number;
    currency: string;
    flw_ref: string;
    charged_amount: number;
  };
}

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async verifyAndEnroll(userId: string, dto: VerifyPaymentDto) {
    // Check for an already-completed payment with the same txRef
    const existingPayment = await this.prisma.payment.findUnique({
      where: { txRef: dto.txRef },
    });

    if (existingPayment?.status === PaymentStatus.COMPLETED) {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId: dto.courseId } },
        include: { course: { select: { id: true, title: true, slug: true } } },
      });
      if (enrollment) {
        return {
          success: true,
          payment: existingPayment,
          enrollment,
          message: 'Already enrolled',
        };
      }
      throw new ConflictException('Payment already processed but enrollment is missing. Contact support.');
    }

    // Validate course
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });
    if (!course) throw new NotFoundException('Course not found');
    if (!course.isPremium) {
      throw new BadRequestException('This course does not require payment');
    }

    // Verify transaction with Flutterwave
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secretKey) {
      throw new BadRequestException('Payment gateway is not configured on this server');
    }

    let verifyData: FlutterwaveVerifyResponse;
    try {
      const response = await fetch(
        `https://api.flutterwave.com/v3/transactions/${dto.transactionId}/verify`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      verifyData = (await response.json()) as FlutterwaveVerifyResponse;
    } catch {
      throw new BadRequestException('Could not reach payment gateway. Try again later.');
    }

    const txData = verifyData.data;

    if (verifyData.status !== 'success' || txData?.status !== 'successful') {
      // Record failed attempt
      await this.prisma.payment.upsert({
        where: { txRef: dto.txRef },
        create: {
          userId,
          courseId: dto.courseId,
          txRef: dto.txRef,
          transactionId: dto.transactionId,
          amount: course.price ?? 0,
          currency: course.currency ?? 'RWF',
          status: PaymentStatus.FAILED,
        },
        update: { status: PaymentStatus.FAILED, transactionId: dto.transactionId },
      });
      throw new BadRequestException('Payment verification failed. Please retry or contact support.');
    }

    if (txData.tx_ref !== dto.txRef) {
      throw new BadRequestException('Transaction reference mismatch. Payment cannot be applied.');
    }

    // Persist completed payment
    const payment = await this.prisma.payment.upsert({
      where: { txRef: dto.txRef },
      create: {
        userId,
        courseId: dto.courseId,
        txRef: dto.txRef,
        transactionId: dto.transactionId,
        amount: txData.amount,
        currency: txData.currency,
        status: PaymentStatus.COMPLETED,
      },
      update: {
        status: PaymentStatus.COMPLETED,
        transactionId: dto.transactionId,
        amount: txData.amount,
        currency: txData.currency,
      },
    });

    // Create enrollment (idempotent)
    let enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: dto.courseId } },
      include: { course: { select: { id: true, title: true, slug: true } } },
    });

    if (!enrollment) {
      enrollment = await this.prisma.enrollment.create({
        data: { userId, courseId: dto.courseId },
        include: { course: { select: { id: true, title: true, slug: true } } },
      });
    }

    return {
      success: true,
      payment,
      enrollment,
      message: 'Payment verified and enrollment created successfully',
    };
  }

  async getMyPayments(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      include: {
        course: {
          select: { id: true, title: true, slug: true, thumbnailUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
