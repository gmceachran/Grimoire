import nodemailer from 'nodemailer';

/**
 * Email service for sending authentication-related emails
 */
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Create transporter based on environment
    if (process.env.NODE_ENV === 'production') {
      // Production: Use real SMTP
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Development: Use Ethereal (fake SMTP for testing)
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'wcjjnhs5oy7eefud@ethereal.email',
          pass: 'AzWB7bSrPg2VzBnVJ5',
        },
      });
    }
  }

  /**
   * Send email verification email
   * @param email - Recipient email
   * @param verificationToken - Verification token
   * @param displayName - User's display name
   */
  async sendVerificationEmail(
    email: string,
    verificationToken: string,
    displayName?: string
  ): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
    
    const html = this.getVerificationEmailTemplate(verificationUrl, displayName);
    
    await this.transporter.sendMail({
      from: `"GRIMOIRE" <${process.env.SMTP_FROM || 'noreply@grimoire.app'}>`,
      to: email,
      subject: 'Verify your GRIMOIRE account',
      html,
    });
  }

  /**
   * Send password reset email
   * @param email - Recipient email
   * @param resetToken - Reset token
   * @param displayName - User's display name
   */
  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    displayName?: string
  ): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    const html = this.getPasswordResetEmailTemplate(resetUrl, displayName);
    
    await this.transporter.sendMail({
      from: `"GRIMOIRE" <${process.env.SMTP_FROM || 'noreply@grimoire.app'}>`,
      to: email,
      subject: 'Reset your GRIMOIRE password',
      html,
    });
  }

  /**
   * Get HTML template for verification email
   */
  private getVerificationEmailTemplate(verificationUrl: string, displayName?: string): string {
    const greeting = displayName ? `Hi ${displayName}` : 'Hi there';
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify your GRIMOIRE account</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1a1a1a; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🌙 GRIMOIRE</h1>
          </div>
          <div class="content">
            <h2>Welcome to GRIMOIRE!</h2>
            <p>${greeting},</p>
            <p>Thank you for signing up for GRIMOIRE, your worldbuilding companion. To get started, please verify your email address by clicking the button below:</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </p>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 4px;">${verificationUrl}</p>
            <p>This link will expire in 24 hours for security reasons.</p>
            <p>If you didn't create a GRIMOIRE account, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2024 GRIMOIRE. All rights reserved.</p>
            <p>This email was sent from a notification-only address that cannot accept incoming email. Please do not reply to this message.</p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Get HTML template for password reset email
   */
  private getPasswordResetEmailTemplate(resetUrl: string, displayName?: string): string {
    const greeting = displayName ? `Hi ${displayName}` : 'Hi there';
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset your GRIMOIRE password</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1a1a1a; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🌙 GRIMOIRE</h1>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>${greeting},</p>
            <p>We received a request to reset your GRIMOIRE password. If you made this request, click the button below to reset your password:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 4px;">${resetUrl}</p>
            <p>This link will expire in 1 hour for security reasons.</p>
            <p><strong>If you didn't request a password reset, please ignore this email.</strong> Your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>© 2024 GRIMOIRE. All rights reserved.</p>
            <p>This email was sent from a notification-only address that cannot accept incoming email. Please do not reply to this message.</p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ Email service connected successfully');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return false;
    }
  }
}
