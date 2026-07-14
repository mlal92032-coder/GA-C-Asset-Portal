/**
 * Slack Integration Service
 * Posts messages to Slack channels for real-time notifications and collaboration
 */

import { WebClient, LogLevel } from '@slack/web-api';
import { logger } from '@/lib/logger';

interface SlackMessage {
  channel: string;
  text: string;
  blocks?: any[];
  attachments?: any[];
  thread_ts?: string;
}

interface SlackMessageResult {
  success: boolean;
  messageTs?: string;
  error?: string;
  timestamp: Date;
}

class SlackService {
  private client: WebClient | null = null;
  private botToken: string | null = null;
  private signingSecret: string | null = null;

  constructor() {
    this.initializeClient();
  }

  /**
   * Initialize Slack Web API client
   */
  private initializeClient(): void {
    this.botToken = process.env.SLACK_BOT_TOKEN;
    this.signingSecret = process.env.SLACK_SIGNING_SECRET;

    if (!this.botToken) {
      logger.warn('Slack bot token not configured. Slack messages will be disabled.');
      return;
    }

    try {
      this.client = new WebClient(this.botToken, {
        logLevel: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.WARN,
      });
      logger.info('Slack service initialized');
    } catch (error) {
      logger.error('Failed to initialize Slack client', error);
    }
  }

  /**
   * Post message to Slack channel
   */
  async postMessage(message: SlackMessage): Promise<SlackMessageResult> {
    if (!this.client) {
      logger.warn('Slack service not configured. Message not posted.', {
        channel: message.channel,
        text: message.text,
      });
      return {
        success: false,
        error: 'Slack service not configured',
        timestamp: new Date(),
      };
    }

    try {
      const result = await this.client.chat.postMessage({
        channel: message.channel,
        text: message.text,
        blocks: message.blocks,
        attachments: message.attachments,
        thread_ts: message.thread_ts,
      });

      logger.info('Slack message posted successfully', {
        channel: message.channel,
        messageTs: result.ts,
      });

      return {
        success: true,
        messageTs: result.ts,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to post Slack message', {
        channel: message.channel,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to post message',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Post asset status change notification
   */
  async notifyAssetStatusChange(data: {
    assetName: string;
    assetTag: string;
    oldStatus: string;
    newStatus: string;
    changedBy: string;
    assetUrl: string;
  }): Promise<SlackMessageResult> {
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: 'Asset Status Changed',
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Asset:*\n${data.assetName}`,
          },
          {
            type: 'mrkdwn',
            text: `*Tag:*\n${data.assetTag}`,
          },
          {
            type: 'mrkdwn',
            text: `*From:*\n${data.oldStatus}`,
          },
          {
            type: 'mrkdwn',
            text: `*To:*\n${data.newStatus}`,
          },
          {
            type: 'mrkdwn',
            text: `*Changed By:*\n${data.changedBy}`,
          },
        ],
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Asset',
              emoji: true,
            },
            value: data.assetUrl,
            url: data.assetUrl,
          },
        ],
      },
    ];

    return this.postMessage({
      channel: '#assets',
      text: `Asset "${data.assetName}" status changed from ${data.oldStatus} to ${data.newStatus}`,
      blocks,
    });
  }

  /**
   * Post maintenance task assigned notification
   */
  async notifyMaintenanceAssigned(data: {
    maintenanceId: string;
    assetName: string;
    assetTag: string;
    assignedTo: string;
    priority: string;
    dueDate: string;
    maintenanceUrl: string;
  }): Promise<SlackMessageResult> {
    const priorityEmoji = data.priority === 'HIGH' ? '🔴' : data.priority === 'MEDIUM' ? '🟡' : '🟢';

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${priorityEmoji} Maintenance Task Assigned`,
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Asset:*\n${data.assetName}`,
          },
          {
            type: 'mrkdwn',
            text: `*Tag:*\n${data.assetTag}`,
          },
          {
            type: 'mrkdwn',
            text: `*Assigned To:*\n${data.assignedTo}`,
          },
          {
            type: 'mrkdwn',
            text: `*Due Date:*\n${data.dueDate}`,
          },
        ],
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Maintenance Task',
              emoji: true,
            },
            value: data.maintenanceId,
            url: data.maintenanceUrl,
          },
        ],
      },
    ];

    return this.postMessage({
      channel: '#maintenance',
      text: `Maintenance task assigned for ${data.assetName} (${data.priority} priority)`,
      blocks,
    });
  }

  /**
   * Post critical alert
   */
  async notifyAlert(data: {
    title: string;
    message: string;
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
    details?: Record<string, string>;
    actionUrl?: string;
  }): Promise<SlackMessageResult> {
    const severityEmoji =
      data.severity === 'CRITICAL' ? '🚨' : data.severity === 'WARNING' ? '⚠️' : 'ℹ️';
    const severityColor =
      data.severity === 'CRITICAL'
        ? '#dc2626'
        : data.severity === 'WARNING'
          ? '#f59e0b'
          : '#3b82f6';

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${severityEmoji} ${data.title}`,
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: data.message,
        },
      },
    ];

    if (data.details && Object.keys(data.details).length > 0) {
      blocks.push({
        type: 'section',
        fields: Object.entries(data.details).map(([key, value]) => ({
          type: 'mrkdwn',
          text: `*${key}:*\n${value}`,
        })),
      });
    }

    if (data.actionUrl) {
      blocks.push({
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Details',
              emoji: true,
            },
            url: data.actionUrl,
          },
        ],
      });
    }

    return this.postMessage({
      channel: '#alerts',
      text: data.title,
      blocks,
      attachments: [
        {
          color: severityColor,
          text: data.message,
        },
      ],
    });
  }

  /**
   * Post bulk operation status
   */
  async notifyBulkOperation(data: {
    operationType: string;
    status: 'STARTED' | 'COMPLETED' | 'FAILED';
    totalRecords?: number;
    successCount?: number;
    failureCount?: number;
    reportUrl?: string;
  }): Promise<SlackMessageResult> {
    const statusEmoji =
      data.status === 'COMPLETED' ? '✅' : data.status === 'FAILED' ? '❌' : '🔄';

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${statusEmoji} Bulk Operation ${data.status}`,
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Operation:*\n${data.operationType}`,
          },
          {
            type: 'mrkdwn',
            text: `*Status:*\n${data.status}`,
          },
          ...(data.totalRecords
            ? [
                {
                  type: 'mrkdwn',
                  text: `*Total:*\n${data.totalRecords}`,
                },
              ]
            : []),
          ...(data.successCount !== undefined
            ? [
                {
                  type: 'mrkdwn',
                  text: `*Successful:*\n${data.successCount}`,
                },
              ]
            : []),
          ...(data.failureCount !== undefined
            ? [
                {
                  type: 'mrkdwn',
                  text: `*Failed:*\n${data.failureCount}`,
                },
              ]
            : []),
        ],
      },
    ];

    if (data.reportUrl) {
      blocks.push({
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Download Report',
              emoji: true,
            },
            url: data.reportUrl,
          },
        ],
      });
    }

    return this.postMessage({
      channel: '#operations',
      text: `Bulk operation "${data.operationType}" - ${data.status}`,
      blocks,
    });
  }

  /**
   * Verify Slack webhook signature for security
   */
  verifySlackSignature(
    timestamp: string,
    signature: string,
    body: string
  ): boolean {
    if (!this.signingSecret) {
      logger.warn('Slack signing secret not configured');
      return false;
    }

    // Check timestamp is within 5 minutes to prevent replay attacks
    const currentTime = Math.floor(Date.now() / 1000);
    if (Math.abs(currentTime - parseInt(timestamp, 10)) > 300) {
      logger.warn('Slack webhook timestamp too old', { timestamp });
      return false;
    }

    // Verify signature
    const crypto = require('crypto');
    const baseString = `v0:${timestamp}:${body}`;
    const mySignature = `v0=${crypto
      .createHmac('sha256', this.signingSecret)
      .update(baseString)
      .digest('hex')}`;

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(mySignature));
  }
}

// Singleton instance
export const slackService = new SlackService();
