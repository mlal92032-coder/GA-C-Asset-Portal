/**
 * Slack Slash Commands API Route
 * Handles /asset, /maintenance, /alert, /checkout commands
 */

import { NextRequest, NextResponse } from 'next/server';
import { slackService } from '@/services/slack.service';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import * as crypto from 'crypto';

/**
 * Helper to verify Slack webhook signature
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
    logger.warn('Slack timestamp verification failed - too old');
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
 * Parse Slack command and return response
 */
async function handleSlackCommand(
  command: string,
  args: string[],
  userId: string,
  responseUrl: string
): Promise<string> {
  logger.info('Processing Slack command', { command, args, userId });

  switch (command) {
    case '/asset':
      return handleAssetCommand(args, responseUrl);

    case '/maintenance':
      return handleMaintenanceCommand(args, responseUrl);

    case '/alert':
      return handleAlertCommand(args, responseUrl);

    case '/checkout':
      return handleCheckoutCommand(args, responseUrl, userId);

    default:
      return 'Unknown command';
  }
}

/**
 * Handle /asset search [name] - Search assets by name
 */
async function handleAssetCommand(args: string[], responseUrl: string): Promise<string> {
  const subcommand = args[0];

  if (!subcommand) {
    return 'Usage: /asset search [name] | /asset status [id] | /asset location [location]';
  }

  try {
    if (subcommand === 'search' && args[1]) {
      const searchTerm = args.slice(1).join(' ');

      // Search in all asset types
      const [furniture, electronics, vehicles] = await Promise.all([
        prisma.furnitureAsset.findMany({
          where: {
            assetName: { contains: searchTerm, mode: 'insensitive' },
          },
          take: 5,
        }),
        prisma.electronicAsset.findMany({
          where: {
            assetName: { contains: searchTerm, mode: 'insensitive' },
          },
          take: 5,
        }),
        prisma.vehicleAsset.findMany({
          where: {
            assetName: { contains: searchTerm, mode: 'insensitive' },
          },
          take: 5,
        }),
      ]);

      const results = [
        ...furniture.map((f) => ({
          name: f.assetName,
          tag: f.assetTag,
          type: 'Furniture',
          status: f.status,
        })),
        ...electronics.map((e) => ({
          name: e.assetName,
          tag: e.assetTag,
          type: 'Electronic',
          status: e.status,
        })),
        ...vehicles.map((v) => ({
          name: v.assetName,
          tag: v.assetTag,
          type: 'Vehicle',
          status: v.status,
        })),
      ];

      if (results.length === 0) {
        return `No assets found matching "${searchTerm}"`;
      }

      const message = results
        .map(
          (r) =>
            `• *${r.name}* (${r.tag}) - ${r.type} - ${r.status}`
        )
        .join('\n');

      return `Found ${results.length} asset(s):\n${message}`;
    }

    if (subcommand === 'status' && args[1]) {
      const assetTag = args[1];

      const [furniture, electronic, vehicle] = await Promise.all([
        prisma.furnitureAsset.findFirst({
          where: { assetTag },
          include: { assignedUser: true, location: true },
        }),
        prisma.electronicAsset.findFirst({
          where: { assetTag },
          include: { assignedUser: true, location: true },
        }),
        prisma.vehicleAsset.findFirst({
          where: { assetTag },
          include: { assignedUser: true, location: true },
        }),
      ]);

      const asset = furniture || electronic || vehicle;

      if (!asset) {
        return `Asset with tag "${assetTag}" not found`;
      }

      return `
*Asset: ${asset.assetName}*
Tag: ${asset.assetTag}
Status: ${asset.status}
Condition: ${asset.condition}
Location: ${asset.location?.locationName || 'Unknown'}
Assigned To: ${asset.assignedUser?.fullName || 'Unassigned'}
`;
    }

    if (subcommand === 'location' && args[1]) {
      const location = args.slice(1).join(' ');

      const [furniture, electronics, vehicles] = await Promise.all([
        prisma.furnitureAsset.findMany({
          where: { location: { locationName: { contains: location, mode: 'insensitive' } } },
          take: 5,
          include: { location: true },
        }),
        prisma.electronicAsset.findMany({
          where: { location: { locationName: { contains: location, mode: 'insensitive' } } },
          take: 5,
          include: { location: true },
        }),
        prisma.vehicleAsset.findMany({
          where: { location: { locationName: { contains: location, mode: 'insensitive' } } },
          take: 5,
          include: { location: true },
        }),
      ]);

      const results = [
        ...furniture.map((f) => ({ name: f.assetName, tag: f.assetTag })),
        ...electronics.map((e) => ({ name: e.assetName, tag: e.assetTag })),
        ...vehicles.map((v) => ({ name: v.assetName, tag: v.assetTag })),
      ];

      if (results.length === 0) {
        return `No assets found at location "${location}"`;
      }

      const message = results
        .map((r) => `• ${r.name} (${r.tag})`)
        .join('\n');

      return `Assets at ${location}:\n${message}`;
    }

    return 'Invalid /asset command syntax';
  } catch (error) {
    logger.error('Error handling /asset command', error);
    return 'Error processing /asset command';
  }
}

/**
 * Handle /maintenance pending - List pending maintenance
 */
async function handleMaintenanceCommand(args: string[], responseUrl: string): Promise<string> {
  const subcommand = args[0];

  if (subcommand === 'pending') {
    try {
      const maintenances = await prisma.maintenance.findMany({
        where: { status: { not: 'COMPLETED' } },
        orderBy: { nextDueDate: 'asc' },
        take: 10,
      });

      if (maintenances.length === 0) {
        return 'No pending maintenance tasks';
      }

      const message = maintenances
        .map(
          (m) =>
            `• ${m.description} - Due: ${m.nextDueDate?.toLocaleDateString()} - Status: ${m.status}`
        )
        .join('\n');

      return `Pending Maintenance (${maintenances.length}):\n${message}`;
    } catch (error) {
      logger.error('Error handling /maintenance command', error);
      return 'Error processing /maintenance command';
    }
  }

  return 'Usage: /maintenance pending';
}

/**
 * Handle /alert [type] - Get alerts by type
 */
async function handleAlertCommand(args: string[], responseUrl: string): Promise<string> {
  const alertType = args[0];

  if (!alertType) {
    return 'Usage: /alert [stock|warranty|maintenance|overdue]';
  }

  try {
    // Get recent alerts based on type
    const alerts = await prisma.notification.findMany({
      where: {
        type: 'WARNING',
        message: { contains: alertType, mode: 'insensitive' },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    if (alerts.length === 0) {
      return `No ${alertType} alerts found`;
    }

    const message = alerts
      .map((a) => `• ${a.title} - ${new Date(a.createdAt).toLocaleDateString()}`)
      .join('\n');

    return `Recent ${alertType} Alerts (${alerts.length}):\n${message}`;
  } catch (error) {
    logger.error('Error handling /alert command', error);
    return 'Error processing /alert command';
  }
}

/**
 * Handle /checkout list - List user's checkouts
 */
async function handleCheckoutCommand(
  args: string[],
  responseUrl: string,
  userId: string
): Promise<string> {
  const subcommand = args[0];

  if (subcommand === 'list') {
    try {
      const checkouts = await prisma.assetCheckout.findMany({
        where: {
          userId,
          checkInDate: null, // Only active checkouts
        },
        orderBy: { expectedReturnDate: 'asc' },
        take: 10,
      });

      if (checkouts.length === 0) {
        return 'You have no active checkouts';
      }

      const message = checkouts
        .map(
          (c) =>
            `• Asset ${c.assetId} - Return by: ${c.expectedReturnDate?.toLocaleDateString() || 'No due date'}`
        )
        .join('\n');

      return `Your Active Checkouts (${checkouts.length}):\n${message}`;
    } catch (error) {
      logger.error('Error handling /checkout command', error);
      return 'Error processing /checkout command';
    }
  }

  return 'Usage: /checkout list';
}

/**
 * POST /api/slack/commands
 * Handle incoming Slack slash commands
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const timestamp = request.headers.get('x-slack-request-timestamp') || '';
    const signature = request.headers.get('x-slack-signature') || '';

    // Verify Slack request
    if (!verifySlackRequest(timestamp, signature, rawBody)) {
      logger.warn('Slack request signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const body = new URLSearchParams(rawBody);
    const command = body.get('command');
    const text = body.get('text') || '';
    const userId = body.get('user_id');
    const responseUrl = body.get('response_url');

    if (!command || !userId || !responseUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const args = text.split(' ').filter((s) => s.length > 0);

    // Handle command asynchronously
    const response = await handleSlackCommand(command, args, userId, responseUrl);

    return NextResponse.json(
      {
        response_type: 'in_channel',
        text: response,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Slack command handler error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
