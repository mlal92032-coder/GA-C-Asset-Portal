# Quick Start: Notifications & Integrations

Get the notification system running in 15 minutes.

## Prerequisites

- Node.js 18+
- PostgreSQL running
- Redis running (for job queue)

## 1. Configure Environment Variables (5 min)

Edit `.env` and add:

```env
# Email (Nodemailer/SMTP)
EMAIL_FROM=noreply@assetmanagement.com
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=465
SMTP_USER=your-mailtrap-email@example.com
SMTP_PASSWORD=your-mailtrap-password

# SMS (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890

# Slack
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Get Credentials

**Email (Mailtrap - Free):**
1. Go to https://mailtrap.io
2. Sign up (free account)
3. Copy API credentials to .env
4. All emails appear in Mailtrap inbox (never actually sent)

**SMS (Twilio - Free Trial):**
1. Go to https://www.twilio.com/console
2. Sign up (includes $15 credit)
3. Create project and get Account SID & Auth Token
4. Add trial phone numbers for testing
5. Get phone number from Twilio console

**Slack (Free):**
1. Go to https://api.slack.com/apps
2. Create New App → From scratch
3. Name it and select a test workspace
4. Go to OAuth & Permissions → Add scopes:
   - `chat:write`
   - `commands` (for slash commands)
5. Install to workspace
6. Copy Bot Token and Signing Secret

## 2. Start Services (5 min)

### Terminal 1: Development Server
```bash
npm run dev
```

Server runs at http://localhost:3000

### Terminal 2: Email Queue Worker
```bash
npm run jobs
```

Email worker starts processing async jobs.

### Verify Redis is Running
```bash
redis-cli ping
# Should return: PONG
```

## 3. Test Notifications (5 min)

### Test Email

```bash
# In a Node.js shell or script:
import { queueEmail } from '@/jobs/email.worker';
import { checkoutExpiryReminderTemplate } from '@/lib/email-templates';

const { subject, html } = checkoutExpiryReminderTemplate({
  recipientName: 'John Doe',
  recipientEmail: 'john@example.com',
  assetName: 'MacBook Pro',
  assetTag: 'ELEC-001',
  expiryDate: '2026-07-20',
  daysRemaining: 2,
  assetUrl: 'http://localhost:3000/assets/electronics/abc123',
});

await queueEmail({
  userId: 'test-user-id',
  recipient: 'john@example.com',
  subject,
  html,
  type: 'CHECKOUT_EXPIRY_REMINDER',
});

console.log('Email queued! Check Mailtrap inbox.');
```

### Test SMS
```typescript
import { smsService } from '@/services/sms.service';

const result = await smsService.sendSMS({
  to: '+1234567890', // Your Twilio trial number
  message: 'Test SMS from Asset Management System',
  eventType: 'URGENT_MAINTENANCE',
});

console.log(result);
```

### Test Slack
```typescript
import { slackService } from '@/services/slack.service';

await slackService.postMessage({
  channel: '#alerts',
  text: 'Test message from Asset Management',
  blocks: [{
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: '*Test Alert*\nThis is a test notification from the system.',
    },
  }],
});
```

## 4. Access Notification Preferences UI

Once running, users can manage preferences:

```
GET /api/notifications/preferences
```

Returns current preferences or creates defaults.

```
PATCH /api/notifications/preferences
```

Update preferences with:
```json
{
  "emailNotificationsEnabled": true,
  "emailFrequency": "DAILY",
  "quietHoursEnabled": true,
  "quietHoursStart": "18:00",
  "quietHoursEnd": "09:00",
  "soundEnabled": true,
  "soundVolume": 50
}
```

## 5. Test Slack Commands

In your Slack workspace, try commands:

```
/asset search laptop
/asset status ELEC-001
/asset location "Building A"
/maintenance pending
/alert stock
/checkout list
```

## 6. Create Slack Channels

Create these channels in your Slack workspace:
- `#assets` - Asset updates
- `#maintenance` - Maintenance tasks
- `#alerts` - Critical alerts
- `#operations` - Bulk operations

## Common Issues

### Emails Not Sending
1. Check Mailtrap credentials are correct
2. Verify email worker is running: `npm run jobs`
3. Check Redis is running: `redis-cli ping`
4. Check server logs for errors

### SMS Not Sending
1. Verify Twilio credentials in .env
2. Phone number must be E.164 format: `+1234567890`
3. Add phone to Twilio trial numbers
4. Check Twilio console for messages

### Slack Commands Not Responding
1. Create slash commands in Slack app settings
2. Set request URL to: `https://your-domain/api/slack/commands`
3. Verify bot is invited to channels
4. Check Slack token has chat:write scope

## Next Steps

1. **Integrate into Existing Routes:**
   - Follow `docs/NOTIFICATION_INTEGRATION_CHECKLIST.md`
   - Add dispatcher calls to asset, maintenance, inventory endpoints

2. **Set Up Cron Jobs:**
   - Expired checkout reminders (daily)
   - Low stock alerts (daily)
   - Warranty expiration alerts (daily)

3. **Create Notification Preferences UI:**
   - Component in user settings page
   - Call GET/PATCH `/api/notifications/preferences`

4. **Test End-to-End:**
   - Create asset, trigger checkout, monitor notifications
   - Assign maintenance, verify Slack message
   - Update stock levels, check low stock alerts

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│         API Route (e.g., /assets/checkout)      │
├─────────────────────────────────────────────────┤
│  1. Update database                             │
│  2. notificationDispatcher.dispatch(context)    │
└────────────┬────────────────────────────────────┘
             │
      ┌──────┴──────┐
      ▼             ▼
   Queue         Preferences
   Email         Check
   (BullMQ)
      │
      ├─→ Email     → Queue in BullMQ
      ├─→ SMS       → Twilio API
      ├─→ Slack     → Slack Web API
      └─→ In-App    → Create Notification record

Worker Process:
┌──────────────────────────────┐
│   npm run jobs               │
├──────────────────────────────┤
│ Email Worker                 │
│ - Concurrency: 5             │
│ - Retries: 3                 │
│ - Status: Processing...      │
└──────────────────────────────┘
```

## File Locations

**Services:**
- Email: `src/services/email.service.ts`
- SMS: `src/services/sms.service.ts`
- Slack: `src/services/slack.service.ts`
- Dispatcher: `src/services/notification-dispatcher.ts`

**API Routes:**
- Preferences: `src/app/api/notifications/preferences/route.ts`
- Slack Commands: `src/app/api/slack/commands/route.ts`
- Slack Actions: `src/app/api/slack/actions/route.ts`

**Templates:**
- Emails: `src/lib/email-templates.ts`

**Workers:**
- Email Queue: `src/jobs/email.worker.ts`
- Bootstrap: `src/workers/bootstrap.ts`

**Documentation:**
- Setup Guide: `docs/PHASE_2C_IMPLEMENTATION.md`
- User Guide: `docs/NOTIFICATIONS_AND_INTEGRATIONS.md`
- Integration Guide: `docs/NOTIFICATION_INTEGRATION_CHECKLIST.md`

## Support

1. Check documentation in `docs/` folder
2. Review implementation checklist for examples
3. Check git log for setup details
4. Review test cases in service files

## Production Checklist

- [ ] Use real email provider (SendGrid, AWS SES)
- [ ] Use production Twilio account
- [ ] Create Slack app in production workspace
- [ ] Configure production database
- [ ] Set up Redis with persistence
- [ ] Monitor email queue depth
- [ ] Set up alerts for queue failures
- [ ] Test all notification types
- [ ] Configure quiet hours for users
- [ ] Train team on preferences UI
