import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
      logger.info('SMTP Email Transporter Initialized');
    } else {
      logger.warn('SMTP credentials not provided. Email notifications will be logged to console only.');
    }
  }

  public async sendLoginNotification(email: string, fullName: string, ipAddress: string): Promise<void> {
    const subject = 'Login Alert - FUOYE Smart Campus';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #166534;">FUOYE Smart Campus Portal</h2>
        <p>Hello <strong>${fullName}</strong>,</p>
        <p>We detected a new login to your campus account from IP Address: <strong>${ipAddress}</strong> at ${new Date().toLocaleString('en-NG')}.</p>
        <p>If this wasn't you, please reset your password immediately or contact campus ICT support.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #666;">Federal University Oye-Ekiti - Smart Campus Management System</p>
      </div>
    `;

    await this.sendMail(email, subject, html);
  }

  public async sendBookingConfirmation(email: string, fullName: string, facilityName: string, roomNumber: string, status: string): Promise<void> {
    const subject = `Booking ${status.toUpperCase()} - ${facilityName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #166534;">Booking Notification</h2>
        <p>Hello <strong>${fullName}</strong>,</p>
        <p>Your space booking request for <strong>${facilityName} (Room ${roomNumber})</strong> has been marked as: <span style="padding: 4px 8px; border-radius: 4px; background: #dcfce7; color: #166534; font-weight: bold;">${status.toUpperCase()}</span>.</p>
        <p>You can check the full details and schedule on your student dashboard.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #666;">Federal University Oye-Ekiti - Smart Campus Management System</p>
      </div>
    `;

    await this.sendMail(email, subject, html);
  }

  private async sendMail(to: string, subject: string, html: string): Promise<void> {
    try {
      if (this.transporter) {
        await this.transporter.sendMail({
          from: env.EMAIL_FROM,
          to,
          subject,
          html,
        });
        logger.info({ to, subject }, 'Email sent successfully');
      } else {
        logger.info({ to, subject }, '[CONSOLE EMAIL MOCK] Email would be sent');
      }
    } catch (err) {
      logger.error({ err, to, subject }, 'Failed to send notification email');
    }
  }
}

export const emailService = new EmailService();
