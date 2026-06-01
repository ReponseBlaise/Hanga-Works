import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly gateway: NotificationsGateway) {
    const appPassword = process.env.APP_PASSWORD;
    if (appPassword) {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER || 'kafurukaleo66@gmail.com',
          pass: appPassword,
        },
      });
      this.logger.log('Nodemailer initialized with Gmail');
    } else {
      this.logger.warn('APP_PASSWORD is not set. Emails will only be logged, not sent.');
    }
  }

  async sendEmail(to: string, subject: string, text: string, html?: string) {
    if (!this.transporter) {
      this.logger.debug(`[MOCK EMAIL] To: ${to} | Subject: ${subject}\nText: ${text}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"HANGA WORKS Support" <kafurukaleo66@gmail.com>',
        to,
        subject,
        text,
        html: html || text,
      });
      this.logger.log(`Email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
    }
  }

  // --- AUTH MODULE HOOKS ---
  async sendRegistrationConfirmation(email: string, name: string) {
    await this.sendEmail(
      email,
      'Welcome to Hanga Works!',
      `Hi ${name}, welcome to Hanga Works. Your registration is successfully complete.`
    );
  }

  async sendPasswordReset(email: string, token: string) {
    const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    await this.sendEmail(
      email,
      'Password Reset Request',
      `Click the following link to reset your password: ${resetUrl}`
    );
  }

  emitUserLoggedIn(userId: string) {
    this.gateway.emitUserLoggedIn(userId);
  }

  // --- TEAMMATE HOOKS (LMS / JOBS) ---
  // Your teammate can call these functions without us touching their files!
  async sendApplicationStatusUpdate(email: string, status: string, jobTitle: string) {
    await this.sendEmail(
      email,
      'Application Status Update',
      `Your application for ${jobTitle} is now: ${status}`
    );
  }

  async sendCourseCompletion(email: string, courseTitle: string) {
    await this.sendEmail(
      email,
      'Congratulations on completing your course!',
      `You have successfully completed: ${courseTitle}.`
    );
  }

  async sendCertificateIssued(email: string, courseTitle: string, certUrl: string) {
    await this.sendEmail(
      email,
      'Your Certificate is Ready!',
      `Your certificate for ${courseTitle} has been issued. View it here: ${certUrl}`
    );
  }
}
