# Notifications and Integrations Guide

## Overview

The EAM system now includes comprehensive multi-channel notification capabilities and third-party integrations:

- **Email Notifications** via Nodemailer with SMTP
- **SMS Notifications** via Twilio (critical alerts only)
- **Slack Integration** with messages, commands, and interactive buttons
- **Notification Preferences** UI for user control
- **Notification Dispatcher** for coordinating channels

## Email Notifications

### Setup

1. Configure SMTP in `.env`:
```env
EMAIL_FROM="noreply@assetmanagement.com"
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT=465
SMTP_USER="your-mailtrap-email"
SMTP_PASSWORD="your-mailtrap-password"
```

2. For production, use a real email provider (SendGrid, AWS SES, etc.)

### Available Email Templates

1. **Checkout Expiry Reminder** - 2 days before checkout expires
2. **Checkout Expired** - When checkout is overdue
3. **Maintenance Assigned** - When maintenance task is assigned to user
4. **Asset Status Changed** - When asset status is updated
5. **Low Stock Alert** - When inventory falls below threshold
6. **Bulk Operation Completed** - After bulk import/export/delete
7. **Welcome Email** - New user account created
8. **Password Reset** - Password reset request with link

### Sending Emails

```typescript
import { notificationDispatcher } from '@/services/notification-dispatcher';

// Trigger email notification
await notificationDispatcher.dispatch({
  userId: user.id,
  type: 'CHECKOUT_EXPIRED',
  data: {
    assetName: 'Dell XPS 13',
    assetTag: 'ELEC-001',
    expiryDate: '2026-07-14',
    daysOverdue: 3,
    assetUrl: 'http://localhost:3000/assets/electronics/abc123',
  },
  channels: ['email', 'in-app'],
});
```

### Email Queue

Emails are processed asynchronously via BullMQ:

```bash
# Start the email worker in a separate process
npm run jobs
```

**Features:**
- 3 automatic retries with exponential backoff
- 5 concurrent email processing
- Persistent queue in Redis
- Audit trail for all sends

### Testing Emails

Use [Mailtrap](https://mailtrap.io) for development:
1. Create free account
2. Copy credentials to `.env`
3. All emails appear in Mailtrap inbox (never actually sent)

## SMS Notifications

### Setup

1. Create Twilio account at https://www.twilio.com/
2. Configure in `.env`:
```env
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="auth_token_here"
TWILIO_PHONE_NUMBER="+1234567890"
```

3. Enable SMS in user profile (add phone number)

### Critical Events for SMS

SMS is only sent for urgent events:
- Urgent maintenance alerts (equipment broken)
- Checkout overdue (3+ days)
- Critical stock alert (below minimum)

### Sending SMS

```typescript
import { notificationDispatcher } from '@/services/notification-dispatcher';

// SMS requires force flag for critical alerts
await notificationDispatcher.dispatch({
  userId: user.id,
  type: 'URGENT_MAINTENANCE',
  data: {
    assetName: 'Forklift',
    priority: 'HIGH',
  },
  channels: ['sms'],
  force: true, // Override quiet hours for critical alert
});
```

### SMS Validation

- Phone numbers must be in E.164 format: `+1234567890`
- Messages truncated to 160 characters
- 2 retry attempts per message

### Testing SMS

Use Twilio Trial Account:
1. Add verified phone numbers (limited to trial numbers)
2. SMS appears in Twilio Console
3. No actual SMS sent in trial mode

## Slack Integration

### Setup

1. Create Slack App at https://api.slack.com/apps
2. Configure in `.env`:
```env
SLACK_BOT_TOKEN="xoxb-your-bot-token"
SLACK_SIGNING_SECRET="your-signing-secret"
```

3. In Slack workspace settings:
   - Create channels: #assets, #maintenance, #alerts, #operations
   - Invite bot to all channels
   - Set Signing Secret in app settings

### Slash Commands

Configure slash commands in Slack app settings:

| Command | URL | Description |
|---------|-----|-------------|
| `/asset` | `POST https://your-domain/api/slack/commands` | Search assets, get status, find by location |
| `/maintenance` | `POST https://your-domain/api/slack/commands` | List pending maintenance tasks |
| `/alert` | `POST https://your-domain/api/slack/commands` | Get alerts by type |
| `/checkout` | `POST https://your-domain/api/slack/commands` | List user's active checkouts |

### Using Slash Commands

In any Slack channel or DM:

```
# Search assets by name
/asset search laptop

# Get asset details by tag
/asset status ELEC-001

# Find assets at a location
/asset location "Building A Floor 3"

# List pending maintenance
/maintenance pending

# Get stock alerts
/alert stock

# List my active checkouts
/checkout list
```

### Slack Message Channels

- **#assets** - Asset status changes, new assets, asset moves
- **#maintenance** - Maintenance tasks assigned, completed, overdue
- **#alerts** - Critical alerts (low stock, expired warranties, overdue checkouts)
- **#operations** - Bulk operations (import, export, delete) with reports

### Interactive Buttons in Slack

Messages include buttons for common actions:

- "View Asset" - Link to asset details in dashboard
- "View Maintenance Task" - Link to maintenance record
- "View Details" - Link to alert or operation
- "Download Report" - Link to generated report

### Approvals via Slack

Pending requests include approval buttons:
- "Approve" - Approve the request
- "Reject" - Reject the request

When clicked, the system updates the database and confirms via Slack message.

### Testing Slack

Use Slack Workspace:
1. Create a workspace at slack.com for testing
2. Create Slack app in that workspace
3. Get bot token and signing secret
4. Configure in `.env`
5. Create test channels (#assets, #alerts, etc.)
6. Test commands and messages

## Notification Preferences

### Accessing User Settings

Users can manage notification preferences at:
- Dashboard → Settings → Notifications
- API: `GET /api/notifications/preferences`

### Available Settings

**Email Settings**
- Enable/disable email notifications
- Email frequency: REALTIME, DAILY, WEEKLY
- Email address override

**In-App Settings**
- Enable/disable in-app notifications
- Enable/disable notification sounds
- Sound volume (0-100%)
- Enable/disable desktop notifications

**Alert Thresholds**
- Maintenance alert: days before due date
- Warranty alert: days before expiration
- Stock alert: minimum threshold
- Budget variance alert: percentage threshold
- Overdue checkout alert: days past due

**Quiet Hours**
- Enable/disable quiet hours
- Start time (e.g., "18:00")
- End time (e.g., "09:00")

**Notification Retention**
- Retention period: 1-365 days
- Auto-delete old notifications

### API Usage

```typescript
// Get preferences
const response = await fetch('/api/notifications/preferences');
const { data } = await response.json();

// Update preferences
await fetch('/api/notifications/preferences', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    emailFrequency: 'DAILY',
    quietHoursEnabled: true,
    quietHoursStart: '18:00',
    quietHoursEnd: '09:00',
    soundVolume: 50,
  }),
});
```

## Notification Dispatcher

### How It Works

The `notificationDispatcher` service coordinates notifications across all channels:

1. **Receive Context** - Type, user ID, and event data
2. **Fetch Preferences** - Load user's channel and frequency preferences
3. **Check Quiet Hours** - Skip if user in quiet hours (unless forced)
4. **Route by Channel** - Send to appropriate channel(s)
5. **Log Activity** - Audit trail for all notifications

### Notification Types

| Type | Email | SMS | Slack | In-App |
|------|-------|-----|-------|--------|
| CHECKOUT_EXPIRY_REMINDER | ✅ | ❌ | ❌ | ✅ |
| CHECKOUT_EXPIRED | ✅ | ✅ | ✅ | ✅ |
| MAINTENANCE_ASSIGNED | ✅ | ❌ | ✅ | ✅ |
| ASSET_STATUS_CHANGED | ✅ | ❌ | ✅ | ✅ |
| LOW_STOCK_ALERT | ✅ | ❌ | ✅ | ✅ |
| BULK_OPERATION_COMPLETED | ✅ | ❌ | ✅ | ✅ |
| WELCOME_EMAIL | ✅ | ❌ | ❌ | ❌ |
| PASSWORD_RESET | ✅ | ❌ | ❌ | ❌ |
| URGENT_MAINTENANCE | ✅ | ✅ | ✅ | ✅ |
| CRITICAL_STOCK_ALERT | ✅ | ✅ | ✅ | ✅ |

### Example Usage

```typescript
import { notificationDispatcher } from '@/services/notification-dispatcher';

// When asset checkout expires
await notificationDispatcher.dispatch({
  userId: user.id,
  type: 'CHECKOUT_EXPIRED',
  data: {
    assetName: 'MacBook Pro',
    assetTag: 'ELEC-042',
    expiryDate: '2026-07-10',
    daysOverdue: 4,
    assetUrl: 'http://localhost:3000/assets/electronics/abc123',
  },
  // Channels default based on type, can override:
  channels: ['email', 'sms', 'slack', 'in-app'],
  // Force skip quiet hours for critical:
  force: true,
});

// When maintenance is assigned
await notificationDispatcher.dispatch({
  userId: maintenance.assignedToId,
  type: 'MAINTENANCE_ASSIGNED',
  data: {
    maintenanceId: maintenance.id,
    assetName: 'Generator',
    assetTag: 'VEH-001',
    taskDescription: 'Oil change and filter replacement',
    dueDate: '2026-07-20',
    priority: 'HIGH',
    maintenanceUrl: 'http://localhost:3000/maintenance/abc123',
  },
});
```

### Quiet Hours Logic

If user has quiet hours enabled and current time falls within the window:
- **In-app notifications** are still created
- **Email/SMS/Slack** notifications are suppressed
- **Critical alerts** (`force: true`) override quiet hours

## Audit Logging

All notification activity is logged to `AuditLog`:
- Email sends (success/failure, message ID)
- SMS sends (success/failure, SID)
- Slack posts (success/failure)
- Preference updates
- Approval actions via Slack

View audit logs in:
- Dashboard → Audit Logs
- Filter by module: NOTIFICATIONS

## Architecture Diagram

```
Event Trigger
(Checkout expires, asset status changes, etc.)
    ↓
notificationDispatcher.dispatch(context)
    ↓
Fetch User & Preferences
    ↓
    ├─→ Email Channel
    │   ├→ Select template
    │   ├→ Render HTML
    │   └→ Queue in BullMQ
    │
    ├─→ SMS Channel
    │   ├→ Check if critical
    │   ├→ Validate phone
    │   └→ Send via Twilio
    │
    ├─→ Slack Channel
    │   ├→ Format rich blocks
    │   └→ Post to channel
    │
    └─→ In-App Channel
        ├→ Create notification record
        └→ WebSocket broadcast
```

## Production Checklist

- [ ] Configure real SMTP provider (SendGrid, AWS SES)
- [ ] Configure Twilio production account
- [ ] Create Slack app and enable in workspace
- [ ] Create required Slack channels
- [ ] Test email delivery
- [ ] Test SMS delivery
- [ ] Test Slack integrations
- [ ] Verify audit logs
- [ ] Set up Redis for job queue
- [ ] Start email worker process
- [ ] Monitor email queue status
- [ ] Set up alerts for queue failures
- [ ] Document Slack commands in workspace
- [ ] Train users on preference settings

## Troubleshooting

### Emails Not Sending

1. Check `.env` SMTP credentials
2. Verify email queue is running: `npm run jobs`
3. Check Redis connection: `redis-cli ping`
4. Check Mailtrap inbox in development
5. Review email worker logs for errors

### SMS Not Sending

1. Verify Twilio credentials in `.env`
2. Check phone number format (must be E.164)
3. Add phone number to Twilio trial numbers if testing
4. Check Twilio console for bounces

### Slack Messages Not Posting

1. Verify bot token has `chat:write` scope
2. Verify bot is invited to channel
3. Check Slack workspace logs
4. Verify webhook signature verification passes

### Notifications Not Respecting Preferences

1. Check user preferences are saved
2. Verify quiet hours timing
3. Check notification type defaults in dispatcher
4. Review logs for preference lookup

## Performance Considerations

- Email queue processes 5 concurrent messages
- SMS API calls are sequential (Twilio rate limits)
- Slack API calls are sequential (Slack rate limits)
- All operations are non-blocking (async)
- Database queries for preferences are cached per request

## Security

- Slack webhook signatures verified on all incoming requests
- Email credentials stored in `.env` (never committed)
- SMS/Twilio credentials stored in `.env`
- User preferences encrypted at rest
- Audit trail tracks all notification activity
- Quiet hours prevent notification spam
- Rate limiting on API endpoints (TODO: implement)
