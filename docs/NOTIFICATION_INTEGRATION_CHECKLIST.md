# Notification Integration Checklist

This checklist helps developers integrate notifications into existing and new API routes.

## Quick Integration Steps

For each event that should trigger notifications:

1. Import the notification dispatcher
2. Call `notificationDispatcher.dispatch()` after successful operation
3. Pass required data based on notification type
4. Add to audit log (already included in dispatcher)

## Asset Checkout Events

### When Checkout Created
- [ ] Route: `POST /api/assets/[type]/[id]/checkout`
- [ ] Trigger: `CHECKOUT_EXPIRY_REMINDER` (after 2 days via cron)
- [ ] Required data: assetName, assetTag, expiryDate, daysRemaining, assetUrl
- [ ] Recipients: User who checked out asset
- [ ] Channels: email, in-app
- [ ] Code example:
```typescript
// After successful checkout creation
await notificationDispatcher.dispatch({
  userId: checkout.userId,
  type: 'CHECKOUT_EXPIRY_REMINDER',
  data: {
    assetName: asset.assetName,
    assetTag: asset.assetTag,
    expiryDate: checkout.expectedReturnDate?.toISOString(),
    daysRemaining: 2,
    assetUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/assets/${assetType}/${assetId}`,
  },
});
```

### When Checkout Expires
- [ ] Route: Automatic via cron job
- [ ] Trigger: `CHECKOUT_EXPIRED`
- [ ] Required data: assetName, assetTag, expiryDate, daysOverdue, assetUrl
- [ ] Recipients: User who checked out asset, Asset manager (admin)
- [ ] Channels: email, SMS (force), Slack, in-app
- [ ] Code example:
```typescript
// In scheduled job checking for expired checkouts
const expiredCheckouts = await prisma.assetCheckout.findMany({
  where: {
    checkInDate: null,
    expectedReturnDate: { lt: new Date() },
  },
  include: { user: true },
});

for (const checkout of expiredCheckouts) {
  const daysOverdue = Math.floor(
    (Date.now() - checkout.expectedReturnDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  await notificationDispatcher.dispatch({
    userId: checkout.userId,
    type: 'CHECKOUT_EXPIRED',
    data: {
      assetName: asset.assetName,
      assetTag: asset.assetTag,
      expiryDate: checkout.expectedReturnDate.toLocaleDateString(),
      daysOverdue,
      assetUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/assets/${assetType}/${checkout.assetId}`,
    },
    force: true, // SMS for critical
  });
}
```

### When Checkout Checked In
- [ ] Route: `POST /api/assets/[type]/[id]/checkin`
- [ ] Optional: Send thank you notification if configured
- [ ] Check user preferences before sending

## Maintenance Events

### When Maintenance Assigned
- [ ] Route: `POST /api/maintenance` or `PATCH /api/maintenance/[id]`
- [ ] Trigger: `MAINTENANCE_ASSIGNED`
- [ ] Required data: maintenanceId, assetName, assetTag, taskDescription, dueDate, priority, maintenanceUrl
- [ ] Recipients: User maintenance is assigned to
- [ ] Channels: email, Slack, in-app
- [ ] Code example:
```typescript
// After assigning maintenance
await notificationDispatcher.dispatch({
  userId: maintenance.assignedToId,
  type: 'MAINTENANCE_ASSIGNED',
  data: {
    maintenanceId: maintenance.id,
    assetName: asset.assetName,
    assetTag: asset.assetTag,
    taskDescription: maintenance.description,
    dueDate: maintenance.dueDate.toLocaleDateString(),
    priority: maintenance.priority,
    maintenanceUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/maintenance/${maintenance.id}`,
  },
});
```

### When Maintenance Marked Urgent
- [ ] Route: `PATCH /api/maintenance/[id]`
- [ ] Trigger: `URGENT_MAINTENANCE`
- [ ] Required data: assetName, priority
- [ ] Recipients: Assigned user, Maintenance manager
- [ ] Channels: email, SMS (force), Slack
- [ ] Add check: only notify if priority changed to HIGH/CRITICAL

### When Maintenance Completed
- [ ] Optional: Send completion notification
- [ ] Route: `PATCH /api/maintenance/[id]` (status: COMPLETED)
- [ ] Recipients: Assigned user (optional)
- [ ] Check user preferences before sending

## Asset Status Change Events

### When Asset Status Changes
- [ ] Route: `PATCH /api/assets/[type]/[id]`
- [ ] Trigger: `ASSET_STATUS_CHANGED`
- [ ] Required data: assetName, assetTag, oldStatus, newStatus, changedBy, reason, assetUrl
- [ ] Recipients: Asset admin only
- [ ] Channels: Slack, in-app
- [ ] Code example:
```typescript
// When updating asset status
if (updateData.status && updateData.status !== asset.status) {
  await notificationDispatcher.dispatch({
    userId: session.user.id, // Log to who made the change
    type: 'ASSET_STATUS_CHANGED',
    data: {
      assetName: asset.assetName,
      assetTag: asset.assetTag,
      oldStatus: asset.status,
      newStatus: updateData.status,
      changedBy: session.user.fullName,
      reason: updateData.statusReason || 'No reason provided',
      assetUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/assets/${assetType}/${id}`,
    },
    channels: ['slack', 'in-app'], // Not email for internal changes
  });
}
```

## Inventory/Stock Events

### When Stock Falls Below Threshold
- [ ] Route: Automatic via inventory check (cron job)
- [ ] Trigger: `LOW_STOCK_ALERT`
- [ ] Required data: assetType, currentStock, minimumThreshold, recommendedOrderQty
- [ ] Recipients: Procurement team, Inventory manager
- [ ] Channels: email, in-app
- [ ] Code example:
```typescript
// In inventory check cron job
const stockLevels = await prisma.furnitureAsset.groupBy({
  by: ['furnitureType'],
  _count: true,
});

const threshold = 10; // Configurable per asset type

for (const stock of stockLevels) {
  if (stock._count < threshold) {
    // Find procurement team user
    const procurementUser = await prisma.user.findFirst({
      where: { designation: { contains: 'Procurement' } },
    });

    if (procurementUser) {
      await notificationDispatcher.dispatch({
        userId: procurementUser.id,
        type: 'LOW_STOCK_ALERT',
        data: {
          assetType: stock.furnitureType,
          currentStock: stock._count,
          minimumThreshold: threshold,
          recommendedOrderQty: Math.ceil(threshold * 1.5),
        },
      });
    }
  }
}
```

### When Stock Critically Low
- [ ] Trigger: `CRITICAL_STOCK_ALERT`
- [ ] Threshold: < 5 items or configurable minimum
- [ ] Recipients: Procurement + management
- [ ] Channels: email, SMS (force), Slack, in-app
- [ ] Add check: only send SMS if critical (< 3 items)

## Bulk Operation Events

### When Bulk Import/Export Completed
- [ ] Route: Async job completion handler
- [ ] Trigger: `BULK_OPERATION_COMPLETED`
- [ ] Required data: operationType, totalRecords, successCount, failureCount, completedAt, reportUrl
- [ ] Recipients: User who initiated operation
- [ ] Channels: email, Slack, in-app
- [ ] Code example:
```typescript
// After bulk operation completes
await notificationDispatcher.dispatch({
  userId: initiatingUserId,
  type: 'BULK_OPERATION_COMPLETED',
  data: {
    operationType: 'BULK_IMPORT_ASSETS',
    totalRecords: 150,
    successCount: 148,
    failureCount: 2,
    completedAt: new Date().toLocaleString(),
    reportUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/reports/bulk-import-${jobId}`,
  },
});
```

## User Account Events

### When New User Created
- [ ] Route: `POST /api/admin/users`
- [ ] Trigger: `WELCOME_EMAIL`
- [ ] Required data: tempPassword, loginUrl, role
- [ ] Recipients: New user
- [ ] Channels: email only
- [ ] Code example:
```typescript
// After user creation
const tempPassword = generateSecurePassword();
const hashedPassword = await hash(tempPassword, 10);

const newUser = await prisma.user.create({
  data: {
    email,
    fullName,
    password: hashedPassword,
    role,
  },
});

await notificationDispatcher.dispatch({
  userId: newUser.id,
  type: 'WELCOME_EMAIL',
  data: {
    tempPassword,
    loginUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/login`,
    role,
  },
  channels: ['email'],
});
```

### When Password Reset Requested
- [ ] Route: `POST /api/auth/forgot-password`
- [ ] Trigger: `PASSWORD_RESET`
- [ ] Required data: resetUrl, expiresIn
- [ ] Recipients: User email
- [ ] Channels: email only
- [ ] Code example:
```typescript
// After generating reset token
const resetToken = generateSecureToken();
const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

await prisma.passwordReset.create({
  data: {
    userId,
    token: hashedToken,
    expiresAt,
  },
});

await notificationDispatcher.dispatch({
  userId,
  type: 'PASSWORD_RESET',
  data: {
    resetUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`,
    expiresIn: '24 hours',
  },
  channels: ['email'],
});
```

## Warranty & Service Events

### When Warranty Expiring Soon
- [ ] Route: Automatic via cron job
- [ ] Trigger: Check NotificationPreference.warrantyAlertDays (default: 30)
- [ ] Recipients: Asset manager, Maintenance team
- [ ] Channels: email, Slack, in-app
- [ ] Example implementation:
```typescript
// Cron job: Check expiring warranties
const preferences = await prisma.notificationPreference.findMany({
  where: { user: { role: 'SUPER_ADMIN' } },
  select: { userId: true, warrantyAlertDays: true },
});

const warranties = await prisma.electronicAsset.findMany({
  where: {
    warrantyEndDate: {
      lte: new Date(Date.now() + preferences[0].warrantyAlertDays * 24 * 60 * 60 * 1000),
      gt: new Date(),
    },
  },
});
```

## Alert Threshold Customization

All alert thresholds come from user's NotificationPreference:
- `maintenanceAlertDays` - Days before maintenance due
- `warrantyAlertDays` - Days before warranty expires
- `stockLevelAlertThreshold` - Minimum stock level
- `budgetVarianceAlertPercent` - Budget variance percentage
- `overdueCheckoutAlertDays` - Days after checkout due

Access in cron jobs:
```typescript
const preference = await prisma.notificationPreference.findUnique({
  where: { userId },
});

const alertDays = preference?.maintenanceAlertDays || 7;
```

## Testing Notifications

### Test Email
```bash
# Terminal 1: Start email worker
npm run jobs

# Terminal 2: Send test email
curl -X POST http://localhost:3000/api/test/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id",
    "type": "CHECKOUT_EXPIRED",
    "assetName": "Test Laptop"
  }'
```

### Test SMS
```bash
# Configure Twilio test credentials in .env first
curl -X POST http://localhost:3000/api/test/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id",
    "phoneNumber": "+1234567890",
    "message": "Test SMS"
  }'
```

### Test Slack
```bash
# Post to Slack
curl -X POST http://localhost:3000/api/slack/test \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "#alerts",
    "title": "Test Alert",
    "message": "This is a test message"
  }'
```

## Common Patterns

### Pattern 1: Update with Notification
```typescript
// Update entity
const updated = await prisma.asset.update({ /* ... */ });

// Dispatch notification
await notificationDispatcher.dispatch({
  userId: session.user.id,
  type: 'ASSET_STATUS_CHANGED',
  data: { /* ... */ },
});

// Return response
return NextResponse.json(updated);
```

### Pattern 2: Batch Notifications
```typescript
// Multiple users get same notification
const users = await prisma.user.findMany({
  where: { role: 'SUPER_ADMIN' },
});

for (const user of users) {
  await notificationDispatcher.dispatch({
    userId: user.id,
    type: 'LOW_STOCK_ALERT',
    data: { /* ... */ },
  });
}
```

### Pattern 3: Conditional Notification
```typescript
// Only notify if status actually changed
if (oldStatus !== newStatus) {
  await notificationDispatcher.dispatch({
    userId: managerId,
    type: 'ASSET_STATUS_CHANGED',
    data: { /* ... */ },
  });
}
```

### Pattern 4: Critical Alert with Force
```typescript
// Critical alerts override quiet hours
await notificationDispatcher.dispatch({
  userId: user.id,
  type: 'URGENT_MAINTENANCE',
  data: { /* ... */ },
  force: true, // Override quiet hours, include SMS
});
```

## Audit Trail Review

All notifications create audit log entries. Query them:

```typescript
const logs = await prisma.auditLog.findMany({
  where: {
    module: 'NOTIFICATIONS',
    action: 'EMAIL_SENT',
  },
  orderBy: { timestamp: 'desc' },
  take: 100,
});

logs.forEach(log => {
  const changes = JSON.parse(log.changes);
  console.log(`Email sent to ${changes.recipient}: ${changes.subject}`);
});
```

## Troubleshooting Integration

**Notification not sending?**
1. Check user has preferences record (auto-created on first access)
2. Verify email/SMS/Slack enabled in preferences
3. Check user not in quiet hours
4. Verify redis running: `redis-cli ping`
5. Check email worker running: `npm run jobs`
6. Review logs for dispatcher errors

**Wrong channel selected?**
1. Check notification type default channels in dispatcher
2. Override channels if needed: `channels: ['email', 'sms']`
3. Verify Slack bot token configured
4. Verify Twilio credentials configured

**Wrong email template?**
1. Verify notification type matches template
2. Check all required data fields passed
3. Review template function in `src/lib/email-templates.ts`
4. Test with Mailtrap

## Next Steps

- [ ] Integrate checkout expiry reminders into checkout creation
- [ ] Add cron job for expired checkout notifications
- [ ] Add cron job for warranty expiration alerts
- [ ] Add cron job for low stock alerts
- [ ] Integrate Slack messages into asset update routes
- [ ] Add test endpoints for manual notification testing
- [ ] Create notification monitoring dashboard
- [ ] Set up alerts for notification queue failures
