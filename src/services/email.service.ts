/**
 * Email Service - Handles email sending via Nodemailer
 * Supports SMTP configuration, retries, and audit logging
 */

import nodemailer from 'nodemailer';
import { logger } from '@/lib/logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: Date;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private maxRetries = 3;
  private retryDelay = 5000; // 5 seconds

  constructor() {
    this.initializeTransporter();
  }

  /**
   * Initialize Nodemailer transporter with SMTP config
   */
  private initializeTransporter(): void {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '465', 10);
    const user = process.env.SMTP_USER;
    const password = process.env.SMTP_PASSWORD;

    if (!host || !user || !password) {
      logger.warn(
        'Email configuration incomplete. Email sending will be disabled.',
        {
          host: !!host,
          user: !!user,
          password: !!password,
        }
      );
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true for 465, false for other ports
        auth: {
          user,
          pass: password,
        },
        pool: {
          maxConnections: 5,
          maxMessages: 100,
          rateDelta: 4000,
          rateLimit: 14,
        },
      });

      // Verify transporter connection
      this.transporter.verify((error) => {
        if (error) {
          logger.error('Email transporter verification failed', error);
        } else {
          logger.info('Email transporter verified and ready');
        }
      });
    } catch (error) {
      logger.error('Failed to initialize email transporter', error);
    }
  }

  /**
   * Send email with retry logic
   */
  async sendEmail(options: EmailOptions): Promise<SendEmailResult> {
    if (!this.transporter) {
      logger.warn('Email service not configured. Email not sent.', {
        to: options.to,
        subject: options.subject,
      });
      return {
        success: false,
        error: 'Email service not configured',
        timestamp: new Date(),
      };
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await this.transporter.sendMail({
          from: process.env.EMAIL_FROM || 'noreply@assetmanagement.com',
          to: options.to,
          cc: options.cc?.join(','),
          bcc: options.bcc?.join(','),
          subject: options.subject,
          html: options.html,
          attachments: options.attachments,
        });

        logger.info('Email sent successfully', {
          to: options.to,
          subject: options.subject,
          messageId: result.messageId,
          attempt,
        });

        return {
          success: true,
          messageId: result.messageId,
          timestamp: new Date(),
        };
      } catch (error) {
        lastError = error as Error;
        logger.warn(`Email send attempt ${attempt} failed`, {
          to: options.to,
          subject: options.subject,
          error: lastError.message,
          attempt,
          maxRetries: this.maxRetries,
        });

        // Wait before retrying (exponential backoff)
        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelay * attempt);
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Email send failed after retries',
      timestamp: new Date(),
    };
  }

  /**
   * Send multiple emails in batch
   */
  async sendBatch(
    options: EmailOptions[]
  ): Promise<SendEmailResult[]> {
    const results = await Promise.allSettled(
      options.map((opt) => this.sendEmail(opt))
    );

    return results.map((result) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          success: false,
          error: result.reason?.message || 'Unknown error',
          timestamp: new Date(),
        };
      }
    });
  }

  /**
   * Helper for exponential backoff delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      logger.error('Email connection test failed', error);
      return false;
    }
  }
}

// Singleton instance
export const emailService = new EmailService();

/**
 * Helper function to log email in audit trail
 */
export async function logEmailInAudit(
  userId: string,
  recipient: string,
  subject: string,
  type: string,
  result: SendEmailResult
): Promise<void> {
  try {
    const { prisma } = await import('@/lib/prisma');

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'EMAIL_SENT',
        module: 'NOTIFICATIONS',
        changes: JSON.stringify({
          recipient,
          subject,
          type,
          messageId: result.messageId,
          success: result.success,
        }),
        timestamp: result.timestamp,
      },
    });
  } catch (error) {
    logger.error('Failed to log email in audit trail', error);
  }
}
