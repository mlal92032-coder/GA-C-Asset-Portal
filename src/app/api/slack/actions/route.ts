/**
 * Slack Interactive Actions API Route
 * Handles button clicks and interactive components from Slack messages
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import * as crypto from 'crypto';

interface SlackInteraction {
  type: string;
  actions?: Array<{
    type: string;
    value?: string;
    action_id?: string;
  }>;
  user?: {
    id: string;
    name: string;
  };
  trigger_id?: string;
  response_url?: string;
}

/**
 * Verify Slack webhook signature
 */
function verifySlackRequest(
  timestamp: string,
  signature: string,
  rawBody: string
): boolean {
  const signingSecret = process.env.SLACK_SIGNING_SECRET;
  if (!signingSecret) return false;

  const time = Math.floor(Date.now() / 1000);
  if (Math.abs(time - parseInt(timestamp, 10)) > 300) {
    logger.warn('Slack timestamp verification failed');
    return false;
  }

  const baseString = `v0:${timestamp}:${rawBody}`;
  const mySignature = `v0=${crypto
    .createHmac('sha256', signingSecret)
    .update(baseString)
    .digest('hex')}`;

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(mySignature));
}

/**
 * Handle button click actions
 */
async function handleButtonAction(
  action: SlackInteraction['actions']?.[0],
  userId: string,
  responseUrl: string | undefined
): Promise<{ text: string; success: boolean }> {
  if (!action) {
    return { text: 'No action found', success: false };
  }

  const actionId = action.action_id;

  if (actionId?.startsWith('approve_request_')) {
    // Approve asset/maintenance request
    const requestId = actionId.replace('approve_request_', '');

    try {
      // Try to find and approve the request (could be asset request, maintenance, etc.)
      await prisma.assetAddRequest.updateMany({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          approvedBy: userId,
          approvedAt: new Date(),
        },
      });

      logger.info('Request approved via Slack', {
        requestId,
        approvedBy: userId,
      });

      // Log to audit trail
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'APPROVE',
          module: 'REQUESTS',
          changes: JSON.stringify({ requestId }),
          timestamp: new Date(),
        },
      });

      return { text: 'Request approved successfully ✅', success: true };
    } catch (error) {
      logger.error('Failed to approve request', error);
      return { text: 'Failed to approve request', success: false };
    }
  }

  if (actionId?.startsWith('reject_request_')) {
    // Reject request
    const requestId = actionId.replace('reject_request_', '');

    try {
      await prisma.assetAddRequest.updateMany({
        where: { id: requestId },
        data: {
          status: 'REJECTED',
          rejectionReason: 'Rejected via Slack',
        },
      });

      logger.info('Request rejected via Slack', {
        requestId,
        rejectedBy: userId,
      });

      // Log to audit trail
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'REJECT',
          module: 'REQUESTS',
          changes: JSON.stringify({ requestId }),
          timestamp: new Date(),
        },
      });

      return { text: 'Request rejected ❌', success: true };
    } catch (error) {
      logger.error('Failed to reject request', error);
      return { text: 'Failed to reject request', success: false };
    }
  }

  if (actionId?.startsWith('acknowledge_alert_')) {
    // Acknowledge alert
    const alertId = actionId.replace('acknowledge_alert_', '');

    try {
      await prisma.notification.update({
        where: { id: alertId },
        data: { isRead: true },
      });

      logger.info('Alert acknowledged via Slack', { alertId, userId });

      return { text: 'Alert acknowledged 👍', success: true };
    } catch (error) {
      logger.error('Failed to acknowledge alert', error);
      return { text: 'Failed to acknowledge alert', success: false };
    }
  }

  return { text: 'Unknown action', success: false };
}

/**
 * POST /api/slack/actions
 * Handle interactive button clicks and actions from Slack
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const timestamp = request.headers.get('x-slack-request-timestamp') || '';
    const signature = request.headers.get('x-slack-signature') || '';

    // Verify Slack request
    if (!verifySlackRequest(timestamp, signature, rawBody)) {
      logger.warn('Slack action signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse the payload from URL-encoded body
    const bodyParams = new URLSearchParams(rawBody);
    const payloadStr = bodyParams.get('payload');

    if (!payloadStr) {
      return NextResponse.json({ error: 'No payload found' }, { status: 400 });
    }

    const payload: SlackInteraction = JSON.parse(payloadStr);

    if (!payload.user?.id) {
      return NextResponse.json({ error: 'No user found' }, { status: 400 });
    }

    // Handle the action
    const result = await handleButtonAction(
      payload.actions?.[0],
      payload.user.id,
      payload.response_url
    );

    // Respond to Slack with message replacement
    if (payload.response_url && result.success) {
      try {
        await fetch(payload.response_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            response_type: 'in_channel',
            text: result.text,
            replace_original: true,
          }),
        });
      } catch (error) {
        logger.error('Failed to send response to Slack response_url', error);
      }
    }

    return NextResponse.json({ text: result.text }, { status: 200 });
  } catch (error) {
    logger.error('Slack action handler error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
