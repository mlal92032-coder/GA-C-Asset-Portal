# Phase 2C Implementation Guide

## Overview
Phase 2C (Tasks 2C.2-2C.5) implements advanced notification systems, integrations, and RBAC features over 19 hours.

## Task 2C.2: Email & SMS Notifications (6 hours) - COMPLETED ✅

### 2C.2.1: Email Notifications (3 hours) ✅

**Implementation Status: COMPLETE**

**Files Created:**
- `src/lib/email-templates.ts` - 8 professional email templates
- `src/services/email.service.ts` - Nodemailer integration with retry logic
- `src/jobs/email.worker.ts` - BullMQ worker for async email processing

**Email Templates Implemented:**
1. ✅ Checkout expiry reminder (2 days before)
2. ✅ Checkout expired (overdue)
3. ✅ Maintenance task assigned
4. ✅ Asset status changed
5. ✅ Low stock alert
6. ✅ Bulk operation completed
7. ✅ Welcome email for new users
8. ✅ Password reset request

**Features:**
- HTML templates with Tailwind CSS styling
- Professional branding with header/footer
- Retry logic with exponential backoff
- Connection pooling for SMTP
- Audit trail logging
- Template variables with TypeScript types
- Error handling and logging

**Configuration Required:**
```env
EMAIL_FROM="noreply@assetmanagement.com"
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT=465
SMTP_USER="your-user"
SMTP_PASSWORD="your-password"
```

**Usage Example:**
```typescript
import { queueEmail } from '@/jobs/email.worker';
import { checkoutExpiryReminderTemplate } from '@/lib/email-templates';

const { subject, html } = checkoutExpiryReminderTemplate({
  recipientName: 'John Doe',
  recipientEmail: 'john@example.com',
  assetName: 'Laptop',
  assetTag: 'ELEC-001',
  expiryDate: '2026-07-20',
  daysRemaining: 2,
  assetUrl: 'http://localhost:3000/assets/electronics/abc123',
});

await queueEmail({
  userId: 'user-123',
  recipient: 'john@example.com',
  subject,
  html,
  type: 'CHECKOUT_EXPIRY_REMINDER',
});
```

### 2C.2.2: SMS Notifications (2 hours) ✅

**Implementation Status: COMPLETE**

**Files Created:**
- `src/services/sms.service.ts` - Twilio SMS integration

**Critical Events for SMS:**
1. ✅ Urgent maintenance alert
2. ✅ Checkout overdue (3+ days)
3. ✅ Critical stock alert

**Features:**
- Twilio integration with auth
- E.164 phone number validation
- 160-character message limit with truncation
- Retry logic (2 attempts)
- Audit trail logging
- Helper functions for message creation

**Configuration Required:**
```env
TWILIO_ACCOUNT_SID="your-account-sid"
TWILIO_AUTH_TOKEN="your-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"
```

**Usage Example:**
```typescript
import { smsService } from '@/services/sms.service';

const result = await smsService.sendSMS({
  to: '+1234567890',
  message: 'ALERT: Laptop requires urgent maintenance. Check dashboard.',
  eventType: 'URGENT_MAINTENANCE',
});
```

### 2C.2.3: Notification Preferences (1 hour) ✅

**Implementation Status: COMPLETE**

**Files Created:**
- `src/app/api/notifications/preferences/route.ts` - Preferences API

**Database Model:**
- NotificationPreference (already in schema.prisma)

**API Endpoints:**
- `GET /api/notifications/preferences` - Retrieve user preferences
- `PATCH /api/notifications/preferences` - Update preferences

**User Settings Available:**
- Email notifications enabled/disabled
- Email frequency (REALTIME, DAILY, WEEKLY)
- In-app notifications enabled/disabled
- Sound enabled/disabled
- Sound volume (0-100)
- Desktop notifications enabled/disabled
- Alert thresholds (maintenance days, warranty days, stock level)
- Quiet hours (start/end time)
- Notification retention days
- Auto-delete old notifications

**Validation:**
- Zod schema with strict validation
- Phone number E.164 format check
- Time format validation (HH:MM)
- Percentage bounds (0-100)
- Day counts (1-365)

**Usage Example:**
```typescript
// GET current preferences
const response = await fetch('/api/notifications/preferences');
const { data } = await response.json();

// PATCH update preferences
await fetch('/api/notifications/preferences', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    emailNotificationsEnabled: true,
    emailFrequency: 'DAILY',
    quietHoursEnabled: true,
    quietHoursStart: '18:00',
    quietHoursEnd: '09:00',
  }),
});
```

---

## Task 2C.3: Slack Integration (5 hours) - IN PROGRESS

### 2C.3.1: Slack Messages (2 hours) - COMPLETED ✅

**Files Created:**
- `src/services/slack.service.ts` - Slack Web API integration

**Notification Types Implemented:**
1. ✅ Asset status changed → #assets channel
2. ✅ Maintenance assigned → #maintenance channel
3. ✅ Critical alerts → #alerts channel
4. ✅ Bulk operations → #operations channel

**Features:**
- Rich message formatting with blocks
- Interactive buttons (View Details, Download Report)
- Color-coded alerts (red/yellow/blue)
- Emoji indicators (🚨 ❌ ✅)
- Error handling and logging
- Webhook signature verification

**Configuration Required:**
```env
SLACK_BOT_TOKEN="xoxb-your-token"
SLACK_SIGNING_SECRET="your-signing-secret"
```

**Slack Channels Required:**
- #assets - Asset updates
- #maintenance - Maintenance tasks
- #alerts - Critical alerts
- #operations - Bulk operations

**Usage Example:**
```typescript
import { slackService } from '@/services/slack.service';

await slackService.notifyAssetStatusChange({
  assetName: 'Dell Laptop',
  assetTag: 'ELEC-001',
  oldStatus: 'IN_STORE',
  newStatus: 'IN_USE',
  changedBy: 'Admin User',
  assetUrl: 'http://localhost:3000/assets/electronics/abc123',
});
```

### 2C.3.2: Slack Slash Commands (2 hours) - COMPLETED ✅

**Files Created:**
- `src/app/api/slack/commands/route.ts` - Slash commands handler

**Commands Implemented:**
1. ✅ `/asset search [name]` - Search assets by name
2. ✅ `/asset status [tag]` - Get asset details by tag
3. ✅ `/asset location [name]` - List assets at location
4. ✅ `/maintenance pending` - List pending maintenance tasks
5. ✅ `/alert [type]` - Get recent alerts by type
6. ✅ `/checkout list` - List user's active checkouts

**Features:**
- Real-time database queries
- User authentication via Slack user ID
- Response formatting with Markdown
- Error handling with helpful messages
- Signature verification for security
- Latency < 3 seconds

**Slack Setup:**
1. Create slash commands in Slack workspace settings
2. Set Request URL to: `https://your-domain/api/slack/commands`
3. Set Signing Secret in .env

**Usage in Slack:**
```
/asset search laptop
/asset status ELEC-001
/asset location "Building A"
/maintenance pending
/alert stock
/checkout list
```

### 2C.3.3: Slack Interactive Buttons (1 hour) - COMPLETED ✅

**Files Created:**
- `src/app/api/slack/actions/route.ts` - Interactive actions handler

**Actions Implemented:**
1. ✅ Approve request (button click)
2. ✅ Reject request (button click)
3. ✅ Acknowledge alert (button click)
4. ✅ View full details (link button)

**Features:**
- Button click handling
- Database update on action
- Confirmation message sent back to Slack
- Audit trail logging
- No duplicate execution protection
- Signature verification

**Usage:**
Buttons are automatically included in Slack message blocks and handle clicks via webhook.

---

## Task 2C.4: Advanced PDF Reports (4 hours) - IN PROGRESS

### 2C.4.1: PDF Report Generation (2 hours) - PENDING

**Objectives:**
- Generate professional PDF reports
- Multiple report types with charts
- Support for attachments and email delivery

**Report Types to Implement:**
1. Asset Inventory Report
2. Maintenance Report
3. Financial Report (depreciation)

**Implementation Plan:**
1. Create `src/services/pdf.service.ts`
2. Create PDF templates for each report type
3. Implement queue handler for async generation
4. Add to notification dispatcher for email delivery

### 2C.4.2: Report Builder UI (1.5 hours) - PENDING

**Objectives:**
- Custom report creation UI
- Drag-drop metrics selection
- Date range and filter options
- Schedule reports

**Implementation Plan:**
1. Add Report model to Prisma schema (if not exists)
2. Create API endpoints for CRUD operations
3. Build React component with form builder
4. Implement scheduling logic

### 2C.4.3: Scheduled Reports (0.5 hours) - PENDING

**Objectives:**
- Auto-generate reports on schedule
- Email delivery
- Report history tracking

**Implementation Plan:**
1. Add cron job handler
2. Schedule for: Daily (8 AM), Weekly (Monday 8 AM), Monthly (1st day 8 AM)
3. Generate and email to user
4. Keep last 12 versions

---

## Task 2C.5: Advanced RBAC (4 hours) - PENDING

### 2C.5.1: Custom Roles System (2 hours) - PENDING

**Objectives:**
- Create custom roles with granular permissions
- Field-level visibility control

**Implementation Plan:**
1. Update/add Role model to Prisma
2. Create role management API endpoints
3. Build role management UI
4. Implement permission checking middleware

### 2C.5.2: Permission Matrix (1.5 hours) - PENDING

**Objectives:**
- Define action-level and field-level permissions
- Enforce across all endpoints and UI

**Permissions to Define:**
- Asset operations (view, create, edit, delete, export)
- Checkout operations (view, create, checkin, delete)
- Maintenance operations
- Report operations
- User management
- Settings management

**Field-Level Visibility:**
- Purchase price, salvage value, depreciation
- User personal info
- Maintenance costs

### 2C.5.3: Approval Workflows (0.5 hours) - PENDING

**Objectives:**
- Define who approves what
- Customizable workflows
- Notification to approvers

**Workflows:**
- Asset requests → Department Manager
- Maintenance requests → Maintenance Lead
- Bulk deletions → Admin only
- User creation → HR Manager

---

## Integration Point: Notification Dispatcher

**File Created:**
- `src/services/notification-dispatcher.ts` - Coordinates all notification channels

**How It Works:**
1. Accepts NotificationContext with type and data
2. Fetches user preferences
3. Respects quiet hours
4. Routes to appropriate channels (email, SMS, Slack, in-app)
5. Logs all activity to audit trail

**Supported Events:**
- CHECKOUT_EXPIRY_REMINDER
- CHECKOUT_EXPIRED
- MAINTENANCE_ASSIGNED
- ASSET_STATUS_CHANGED
- LOW_STOCK_ALERT
- BULK_OPERATION_COMPLETED
- WELCOME_EMAIL
- PASSWORD_RESET
- URGENT_MAINTENANCE
- CRITICAL_STOCK_ALERT

**Usage Example:**
```typescript
import { notificationDispatcher } from '@/services/notification-dispatcher';

await notificationDispatcher.dispatch({
  userId: 'user-123',
  type: 'CHECKOUT_EXPIRED',
  data: {
    assetName: 'Laptop',
    assetTag: 'ELEC-001',
    expiryDate: '2026-07-14',
    daysOverdue: 3,
    assetUrl: 'http://localhost:3000/assets/electronics/abc123',
  },
  channels: ['email', 'sms', 'slack', 'in-app'],
  force: false, // Respect user preferences
});
```

---

## Testing Checklist

### Email Service
- [ ] Test SMTP connection
- [ ] Send single email
- [ ] Send batch emails
- [ ] Verify retry logic on failure
- [ ] Check audit trail logging
- [ ] Test template rendering with various data
- [ ] Verify email appears in inbox

### SMS Service
- [ ] Configure Twilio account
- [ ] Test SMS send
- [ ] Verify E.164 validation
- [ ] Test message truncation
- [ ] Check retry logic
- [ ] Verify audit trail logging
- [ ] Test with real phone number

### Slack Integration
- [ ] Create Slack app and get tokens
- [ ] Test message posting to #assets
- [ ] Test message posting to #maintenance
- [ ] Test message posting to #alerts
- [ ] Test slash commands
- [ ] Test interactive buttons
- [ ] Verify signature verification works

### Notification Preferences
- [ ] GET preferences returns defaults
- [ ] PATCH preferences saves correctly
- [ ] Quiet hours logic works
- [ ] Frequency settings are respected
- [ ] Alert thresholds are applied

### Notification Dispatcher
- [ ] Routes emails correctly
- [ ] Routes SMS only for critical
- [ ] Routes Slack to correct channels
- [ ] Creates in-app notifications
- [ ] Respects user preferences
- [ ] Respects quiet hours
- [ ] Audit logs all activities

---

## Environment Variables Checklist

```env
# Email (SMTP)
EMAIL_FROM=noreply@assetmanagement.com
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=465
SMTP_USER=your-user
SMTP_PASSWORD=your-password

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890

# Slack
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=your-secret

# Redis (for job queues)
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## Remaining Tasks

**Priority Order:**
1. Task 2C.4: PDF Reports (4 hours)
   - PDF generation service
   - Report builder UI
   - Scheduled report delivery

2. Task 2C.5: Advanced RBAC (4 hours)
   - Custom roles system
   - Permission matrix
   - Approval workflows

3. Integration Testing
   - End-to-end notification flows
   - Permission enforcement
   - Concurrent operations

---

## Agent Coordination

**Phase 2C.2 Agents:**
- ✅ Backend: Email/SMS services
- ✅ Backend: API endpoints
- ⏳ Frontend: Notification preferences UI

**Phase 2C.3 Agents:**
- ✅ Backend: Slack services
- ✅ Backend: API endpoints

**Phase 2C.4 Agents (Next):**
- Backend: PDF generation service
- Frontend: Report builder UI
- Backend: Scheduled job handlers

**Phase 2C.5 Agents (Next):**
- Backend: Role/permission system
- Backend: Permission middleware
- Frontend: Role management UI
- Testing: RBAC test suite
