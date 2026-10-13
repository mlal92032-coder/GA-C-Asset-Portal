/**
 * SMS Service - Handles SMS sending via Twilio
 * Limited to urgent alerts only to minimize costs
 */

import twilio from 'twilio';
import { logger } from '@/lib/logger';

interface SMSOptions {
  to: string; // Phone number in E.164 format (e.g., +1234567890)
  message: string;
  eventType: 'URGENT_MAINTENANCE' | 'OVERDUE_CHECKOUT' | 'CRITICAL_STOCK';
}

interface SendSMSResult {
  success: boolean;
  sid?: string; // Twilio message SID
  error?: string;
  timestamp: Date;
}

class SMSService {
  private client: twilio.Twilio | null = null;
  private fromNumber: string | null = null;
  private maxRetries = 2;
  private messageCharLimit = 160;

  constructor() {
    this.initializeClient();
  }

  /**
   * Initialize Twilio client
   */
  private initializeClient(): void {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      logger.warn('Twilio configuration incomplete. SMS sending will be disabled.', {
        accountSid: !!accountSid,
        authToken: !!authToken,
        fromNumber: !!fromNumber,
      });
      return;
    }

    try {
      this.client = twilio(accountSid, authToken);
      this.fromNumber = fromNumber;
      logger.info('Twilio SMS service initialized');
    } catch (error) {
      logger.error('Failed to initialize Twilio client', error);
    }
  }

  /**
   * Send SMS with validation and retry logic
   */
  async sendSMS(options: SMSOptions): Promise<SendSMSResult> {
    if (!this.client || !this.fromNumber) {
      logger.warn('SMS service not configured. Message not sent.', {
        to: options.to,
        message: options.message,
      });
      return {
        success: false,
        error: 'SMS service not configured',
        timestamp: new Date(),
      };
    }

    // Validate phone number format
    if (!this.isValidPhoneNumber(options.to)) {
      logger.error('Invalid phone number format', {
        to: options.to,
        message: options.message,
      });
      return {
        success: false,
        error: 'Invalid phone number format. Use E.164 format: +1234567890',
        timestamp: new Date(),
      };
    }

    // Truncate message to character limit if needed
    const truncatedMessage = this.truncateMessage(options.message);
    if (truncatedMessage !== options.message) {
      logger.warn('SMS message truncated to 160 characters', {
        to: options.to,
        originalLength: options.message.length,
        truncatedLength: truncatedMessage.length,
      });
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const message = await this.client.messages.create({
          body: truncatedMessage,
          from: this.fromNumber,
          to: options.to,
        });

        logger.info('SMS sent successfully', {
          to: options.to,
          eventType: options.eventType,
          sid: message.sid,
          attempt,
        });

        return {
          success: true,
          sid: message.sid,
          timestamp: new Date(),
        };
      } catch (error) {
        lastError = error as Error;
        logger.warn(`SMS send attempt ${attempt} failed`, {
          to: options.to,
          eventType: options.eventType,
          error: lastError.message,
          attempt,
          maxRetries: this.maxRetries,
        });

        // Wait before retrying
        if (attempt < this.maxRetries) {
          await this.delay(3000 * attempt);
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'SMS send failed after retries',
      timestamp: new Date(),
    };
  }

  /**
   * Send bulk SMS to multiple recipients
   */
  async sendBatch(options: SMSOptions[]): Promise<SendSMSResult[]> {
    const results = await Promise.allSettled(
      options.map((opt) => this.sendSMS(opt))
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
   * Validate phone number in E.164 format
   */
  private isValidPhoneNumber(phoneNumber: string): boolean {
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phoneNumber);
  }

  /**
   * Truncate message to 160 characters (SMS limit)
   */
  private truncateMessage(message: string): string {
    if (message.length <= this.messageCharLimit) {
      return message;
    }
    return message.substring(0, this.messageCharLimit - 3) + '...';
  }

  /**
   * Helper for delay between retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const smsService = new SMSService();

/**
 * Create SMS message for urgent maintenance alert
 */
export function createUrgentMaintenanceAlert(
  assetName: string,
  priority: string
): string {
  return `ALERT: ${assetName} requires urgent maintenance (Priority: ${priority}). Check your dashboard for details.`.substring(0, 160);
}

/**
 * Create SMS message for overdue checkout
 */
export function createOverdueCheckoutAlert(
  assetName: string,
  daysOverdue: number
): string {
  return `ACTION REQUIRED: Asset ${assetName} is ${daysOverdue} days overdue. Please return immediately.`.substring(0, 160);
}

/**
 * Create SMS message for critical stock alert
 */
export function createCriticalStockAlert(
  assetType: string,
  currentStock: number
): string {
  return `STOCK ALERT: ${assetType} stock is critically low (${currentStock} units). Order needed.`.substring(0, 160);
}

/**
 * Helper function to log SMS in audit trail
 */
export async function logSMSInAudit(
  userId: string,
  phoneNumber: string,
  message: string,
  eventType: string,
  result: SendSMSResult
): Promise<void> {
  try {
    const { prisma } = await import('@/lib/prisma');

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'SMS_SENT',
        module: 'NOTIFICATIONS',
        changes: JSON.stringify({
          phoneNumber,
          message: message.substring(0, 100),
          eventType,
          sid: result.sid,
          success: result.success,
        }),
        timestamp: result.timestamp,
      },
    });
  } catch (error) {
    logger.error('Failed to log SMS in audit trail', error);
  }
}
