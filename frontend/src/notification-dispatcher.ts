/**
 * Notification Dispatcher Service
 * Coordinates sending notifications via multiple channels (email, SMS, Slack, in-app)
 * Respects user notification preferences
 */

import { prisma } from '@/lib/prisma';
import { emailService, logEmailInAudit } from '@/services/email.service';
import { smsService, logSMSInAudit } from '@/services/sms.service';
import { slackService } from '@/services/slack.service';
import { queueEmail } from '@/jobs/email.worker';
import { logger } from '@/lib/logger';
import {
  checkoutExpiryReminderTemplate,
  checkoutExpiredTemplate,
  maintenanceAssignedTemplate,
  assetStatusChangedTemplate,
  lowStockAlertTemplate,
  bulkOperationCompletedTemplate,
  welcomeEmailTemplate,
  passwordResetTemplate,
} from '@/lib/email-templates';

export type NotificationType =
  | 'CHECKOUT_EXPIRY_REMINDER'
  | 'CHECKOUT_EXPIRED'
  | 'MAINTENANCE_ASSIGNED'
  | 'ASSET_STATUS_CHANGED'
  | 'LOW_STOCK_ALERT'
  | 'BULK_OPERATION_COMPLETED'
  | 'WELCOME_EMAIL'
  | 'PASSWORD_RESET'
  | 'URGENT_MAINTENANCE'
  | 'CRITICAL_STOCK_ALERT';

export interface NotificationContext {
  userId: string;
  type: NotificationType;
  data: Record<string, any>;
  channels?: ('email' | 'sms' | 'slack' | 'in-app')[];
  force?: boolean; // Override user preferences
}

class NotificationDispatcher {
  /**
   * Dispatch notification through appropriate channels based on user preferences
   */
  async dispatch(context: NotificationContext): Promise<void> {
    try {
      // Get user
      const user = await prisma.user.findUnique({
        where: { id: context.userId },
      });

      if (!user) {
        logger.warn('User not found for notification dispatch', {
          userId: context.userId,
        });
        return;
      }

      // Get user's notification preferences
      const preferences = await prisma.notificationPreference.findUnique({
        where: { userId: context.userId },
      });

      // Determine which channels to use
      const channels = context.channels || this.getDefaultChannels(context.type);

      // Check quiet hours
      if (preferences?.quietHoursEnabled) {
        const isInQuietHours = this.isInQuietHours(
          preferences.quietHoursStart,
          preferences.quietHoursEnd
        );
        if (isInQuietHours && !context.force) {
          logger.info('User in quiet hours, notification queued', {
            userId: context.userId,
            type: context.type,
          });
          // Still send to in-app
          if (channels.includes('in-app')) {
            await this.sendInAppNotification(context);
          }
          return;
        }
      }

      // Send through each channel
      const results = {
        email: false,
        sms: false,
        slack: false,
        inApp: false,
      };

      if (channels.includes('email') && preferences?.emailNotificationsEnabled && context.force !== false) {
        results.email = await this.sendEmailNotification(context, preferences);
      }

      if (channels.includes('sms') && context.force) {
        results.sms = await this.sendSMSNotification(context, user);
      }

      if (channels.includes('slack')) {
        results.slack = await this.sendSlackNotification(context);
      }

      if (channels.includes('in-app')) {
        results.inApp = await this.sendInAppNotification(context);
      }

      logger.info('Notification dispatched', {
        userId: context.userId,
        type: context.type,
        results,
      });
    } catch (error) {
      logger.error('Failed to dispatch notification', {
        userId: context.userId,
        type: context.type,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(
    context: NotificationContext,
    preferences: any
  ): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: context.userId },
      });

      if (!user) return false;

      const emailAddress = preferences?.emailAddress || user.email;
      let emailData: any;

      // Generate email template based on type
      switch (context.type) {
        case 'CHECKOUT_EXPIRY_REMINDER':
          emailData = checkoutExpiryReminderTemplate({
            recipientName: user.fullName,
            recipientEmail: emailAddress,
            ...context.data,
          });
          break;

        case 'CHECKOUT_EXPIRED':
          emailData = checkoutExpiredTemplate({
            recipientName: user.fullName,
            recipientEmail: emailAddress,
            ...context.data,
          });
          break;

        case 'MAINTENANCE_ASSIGNED':
          emailData = maintenanceAssignedTemplate({
            recipientName: user.fullName,
            recipientEmail: emailAddress,
            ...context.data,
          });
          break;

        case 'ASSET_STATUS_CHANGED':
          emailData = assetStatusChangedTemplate({
            recipientName: user.fullName,
            recipientEmail: emailAddress,
            ...context.data,
          });
          break;

        case 'LOW_STOCK_ALERT':
          emailData = lowStockAlertTemplate({
            recipientName: user.fullName,
            recipientEmail: emailAddress,
            ...context.data,
          });
          break;

        case 'BULK_OPERATION_COMPLETED':
          emailData = bulkOperationCompletedTemplate({
            recipientName: user.fullName,
            recipientEmail: emailAddress,
            ...context.data,
          });
          break;

        case 'WELCOME_EMAIL':
          emailData = welcomeEmailTemplate({
            recipientName: user.fullName,
            recipientEmail: emailAddress,
            ...context.data,
          });
          break;

        case 'PASSWORD_RESET':
          emailData = passwordResetTemplate({
            recipientName: user.fullName,
            recipientEmail: emailAddress,
            ...context.data,
          });
          break;

        default:
          return false;
      }

      // Queue email
      await queueEmail({
        userId: context.userId,
        recipient: emailAddress,
        subject: emailData.subject,
        html: emailData.html,
        type: context.type,
      });

      return true;
    } catch (error) {
      logger.error('Failed to send email notification', error);
      return false;
    }
  }

  /**
   * Send SMS notification (only for critical alerts)
   */
  private async sendSMSNotification(
    context: NotificationContext,
    user: any
  ): Promise<boolean> {
    try {
      if (!user.phone) {
        logger.warn('User has no phone number for SMS', {
          userId: context.userId,
        });
        return false;
      }

      let message = '';

      switch (context.type) {
        case 'URGENT_MAINTENANCE':
          message = `ALERT: ${context.data.assetName} requires urgent maintenance. Check your dashboard for details.`;
          break;

        case 'CHECKOUT_EXPIRED':
          message = `ACTION REQUIRED: Asset ${context.data.assetName} is overdue. Please return immediately.`;
          break;

        case 'CRITICAL_STOCK_ALERT':
          message = `STOCK ALERT: ${context.data.assetType} stock is critically low. Order needed.`;
          break;

        default:
          return false;
      }

      const result = await smsService.sendSMS({
        to: user.phone,
        message,
        eventType: context.type as 'URGENT_MAINTENANCE' | 'OVERDUE_CHECKOUT' | 'CRITICAL_STOCK',
      });

      if (result.success) {
        await logSMSInAudit(context.userId, user.phone, message, context.type, result);
      }

      return result.success;
    } catch (error) {
      logger.error('Failed to send SMS notification', error);
      return false;
    }
  }

  /**
   * Send Slack notification
   */
  private async sendSlackNotification(context: NotificationContext): Promise<boolean> {
    try {
      switch (context.type) {
        case 'ASSET_STATUS_CHANGED':
          await slackService.notifyAssetStatusChange(context.data);
          break;

        case 'MAINTENANCE_ASSIGNED':
          await slackService.notifyMaintenanceAssigned(context.data);
          break;

        case 'URGENT_MAINTENANCE':
        case 'LOW_STOCK_ALERT':
        case 'CRITICAL_STOCK_ALERT':
          await slackService.notifyAlert({
            title: context.data.title || 'Alert',
            message: context.data.message || '',
            severity: context.data.severity || 'WARNING',
            details: context.data.details,
            actionUrl: context.data.actionUrl,
          });
          break;

        case 'BULK_OPERATION_COMPLETED':
          await slackService.notifyBulkOperation(context.data);
          break;

        default:
          return false;
      }

      return true;
    } catch (error) {
      logger.error('Failed to send Slack notification', error);
      return false;
    }
  }

  /**
   * Send in-app notification
   */
  private async sendInAppNotification(context: NotificationContext): Promise<boolean> {
    try {
      await prisma.notification.create({
        data: {
          userId: context.userId,
          title: context.data.title || context.type,
          message: context.data.message || '',
          type: this.getNotificationType(context.type),
          metadata: JSON.stringify(context.data),
          link: context.data.link,
        },
      });

      return true;
    } catch (error) {
      logger.error('Failed to create in-app notification', error);
      return false;
    }
  }

  /**
   * Get default channels for notification type
   */
  private getDefaultChannels(type: NotificationType): ('email' | 'sms' | 'slack' | 'in-app')[] {
    switch (type) {
      case 'URGENT_MAINTENANCE':
      case 'CRITICAL_STOCK_ALERT':
        return ['email', 'sms', 'slack', 'in-app'];

      case 'CHECKOUT_EXPIRED':
        return ['email', 'slack', 'in-app'];

      case 'ASSET_STATUS_CHANGED':
      case 'MAINTENANCE_ASSIGNED':
      case 'BULK_OPERATION_COMPLETED':
        return ['email', 'slack', 'in-app'];

      default:
        return ['email', 'in-app'];
    }
  }

  /**
   * Check if user is in quiet hours
   */
  private isInQuietHours(start?: string, end?: string): boolean {
    if (!start || !end) return false;

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Simple string comparison (works for 24-hour format)
    if (start < end) {
      return currentTime >= start && currentTime < end;
    } else {
      // Quiet hours span midnight
      return currentTime >= start || currentTime < end;
    }
  }

  /**
   * Map notification type to database type
   */
  private getNotificationType(type: NotificationType): string {
    if (type.includes('URGENT') || type.includes('CRITICAL')) {
      return 'ERROR';
    } else if (type.includes('COMPLETED') || type.includes('WELCOME')) {
      return 'SUCCESS';
    } else if (type.includes('EXPIRED') || type.includes('STOCK')) {
      return 'WARNING';
    }
    return 'INFO';
  }
}

// Singleton instance
export const notificationDispatcher = new NotificationDispatcher();
