import nodemailer from 'nodemailer';

export const sendResetPasswordEmail = async (to: string, resetUrl: string): Promise<void> => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass || emailPass === 'your-16-character-app-password') {
    console.warn('[Email Service Warning]: EMAIL_USER or EMAIL_PASS environment variables are not configured correctly in your .env file.');
    console.log('------------------- RESET PASSWORD EMAIL (MOCK FALLBACK) -------------------');
    console.log(`To: ${to}`);
    console.log(`Link: ${resetUrl}`);
    console.log('----------------------------------------------------------------------------\n');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true', // true for port 465, false for 587
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"HANGA WORKS Support" <${emailUser}>`,
    to,
    subject: 'Reset Your Password - HANGA WORKS',
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 700;">HANGA WORKS</h2>
        </div>
        
        <h3 style="color: #0f172a; font-size: 18px; margin-top: 0; margin-bottom: 16px;">Password Reset Request</h3>
        <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
          We received a request to reset your password for your HANGA WORKS account. Please click the button below to create a new password. This link is only valid for 15 minutes.
        </p>
        
        <div style="text-align: center; margin: 35px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
            Reset Your Password
          </a>
        </div>
        
        <p style="font-size: 14px; line-height: 1.5; color: #64748b; margin-bottom: 24px;">
          If the button above does not work, copy and paste this URL into your browser: <br/>
          <a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
        </p>
        
        <p style="font-size: 14px; line-height: 1.5; color: #64748b; margin-bottom: 0;">
          If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>
        
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
        
        <div style="text-align: center; font-size: 12px; color: #94a3b8;">
          <p style="margin: 0 0 8px 0;">© ${new Date().getFullYear()} HANGA WORKS. All rights reserved.</p>
          <p style="margin: 0;">This is an automated system email. Please do not reply directly.</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service]: Password reset email successfully sent to ${to}. Message ID: ${info.messageId}`);
  } catch (error: any) {
    console.error(`[Email Service Error]: Failed to send password reset email to ${to}:`, error);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};
