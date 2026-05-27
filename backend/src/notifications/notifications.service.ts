import { Injectable, Logger } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly gateway: NotificationsGateway) {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (apiKey) {
      sgMail.setApiKey(apiKey);
    } else {
      this.logger.warn('SENDGRID_API_KEY is not set. Emails will only be logged, not sent.');
    }
  }

  async sendEmail(to: string, subject: string, text: string, html?: string) {
    if (!process.env.SENDGRID_API_KEY) {
      this.logger.debug(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
      return;
    }

    try {
      await sgMail.send({
        to,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@hangaworks.com',
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
