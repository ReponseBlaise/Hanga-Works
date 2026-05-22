import sgMail from '@sendgrid/mail';
import { emitToUser } from '../utils/socket';

export class NotificationService {
  /**
   * Initialize SendGrid.
   * If the API key is the default mock key, it will just log to the console.
   */
  private static get isMockMode() {
    const apiKey = process.env.SENDGRID_API_KEY;
    return !apiKey || apiKey.includes('mock-sendgrid');
  }

  static init() {
    if (!this.isMockMode) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
    }
  }

  /**
   * Internal method to dispatch an email via SendGrid or Mock.
   */
  private static async dispatchEmail(to: string, subject: string, html: string) {
    if (this.isMockMode) {
      console.log(`\n--- SENDGRID MOCK EMAIL ---`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body (HTML): ${html}`);
      console.log(`---------------------------\n`);
      return;
    }

    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL || 'support@hangaworks.com',
      subject,
      html,
    };

    try {
      await sgMail.send(msg);
      console.log(`[SendGrid] Email sent successfully to ${to}`);
    } catch (error: any) {
      console.error('[SendGrid] Error sending email:', error.response?.body || error);
    }
  }

  /**
   * Internal method to dispatch a real-time socket event.
   */
  private static dispatchInAppNotification(userId: string | number, type: string, payload: any) {
    const delivered = emitToUser(userId, 'notification', { type, ...payload });
    if (delivered) {
      console.log(`[Socket.IO] Notification '${type}' delivered live to user ${userId}`);
    } else {
      console.log(`[Socket.IO] User ${userId} is offline. Notification '${type}' skipped (would be saved to DB).`);
      // Future enhancement: Save to Notification table in Prisma
    }
  }

  // =========================================================================
  // SPECIFIC NOTIFICATION EVENTS
  // =========================================================================

  /**
   * 1. Registration Confirmation
   */
  static async sendRegistrationConfirmation(user: { id: string | number; email: string; name: string }) {
    // 1. Send Email
    const html = `
      <h2>Welcome to HANGA WORKS, ${user.name}!</h2>
      <p>Your registration was successful. We're excited to have you on board to build your skills and career.</p>
    `;
    await this.dispatchEmail(user.email, 'Welcome to HANGA WORKS!', html);

    // 2. In-App Notification (In case they login instantly via token)
    this.dispatchInAppNotification(user.id, 'registration_success', {
      message: 'Welcome! Your account is fully set up.',
    });
  }

  /**
   * 2. Application Status Update
   */
  static async sendApplicationStatusUpdate(user: { id: string | number; email: string }, jobTitle: string, newStatus: string) {
    const html = `
      <h2>Application Status Update</h2>
      <p>Your application for <strong>${jobTitle}</strong> has been updated to: <strong>${newStatus}</strong>.</p>
    `;
    await this.dispatchEmail(user.email, `Application Update: ${jobTitle}`, html);

    this.dispatchInAppNotification(user.id, 'application-status', {
      jobTitle,
      status: newStatus,
      message: `Your application for ${jobTitle} is now ${newStatus}.`
    });
  }

  /**
   * 3. Course Completion
   */
  static async sendCourseCompletion(user: { id: string | number; email: string }, courseTitle: string) {
    const html = `
      <h2>Congratulations!</h2>
      <p>You have successfully completed the course: <strong>${courseTitle}</strong>.</p>
    `;
    await this.dispatchEmail(user.email, 'Course Completed!', html);

    this.dispatchInAppNotification(user.id, 'course-complete', {
      courseTitle,
      message: `You completed ${courseTitle}!`
    });
  }

  /**
   * 4. Certificate Issued
   */
  static async sendCertificateIssued(user: { id: string | number; email: string }, certName: string, downloadUrl: string) {
    const html = `
      <h2>Your Certificate is Ready</h2>
      <p>You have been issued a new certificate: <strong>${certName}</strong>.</p>
      <p><a href="${downloadUrl}">Download Certificate</a></p>
    `;
    await this.dispatchEmail(user.email, 'New Certificate Issued', html);

    this.dispatchInAppNotification(user.id, 'cert-issued', {
      certName,
      downloadUrl,
      message: `You earned a new certificate: ${certName}`
    });
  }

  /**
   * 5. Job Match
   */
  static async sendJobMatchAlert(user: { id: string | number; email: string }, jobTitle: string, companyName: string) {
    const html = `
      <h2>New Job Match!</h2>
      <p>We found a new job that matches your skills: <strong>${jobTitle}</strong> at ${companyName}.</p>
    `;
    await this.dispatchEmail(user.email, 'New Job Match for You', html);

    this.dispatchInAppNotification(user.id, 'job-match', {
      jobTitle,
      companyName,
      message: `New match: ${jobTitle} at ${companyName}`
    });
  }
}

// Initialize SendGrid config on module load
NotificationService.init();
