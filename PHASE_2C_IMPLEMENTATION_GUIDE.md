# Phase 2C Implementation Guide
## Advanced Integrations - Complete Technical Guide

**Status**: Phase 2C.1 Infrastructure Complete (Task 2C.1 Foundation Ready)
**Date**: 2026-07-14
**Time Estimate**: 20-25 hours total

---

## WHAT'S BEEN COMPLETED (Phase 2C.1 Foundation)

### ✅ WebSocket Infrastructure
- `src/websocket/server.ts` - Full Socket.io server with:
  - User authentication middleware
  - Company-based room isolation
  - Real-time event broadcasting
  - Presence tracking (online/offline)
  - Graceful shutdown handling

### ✅ Real-Time Client Hooks
- `src/hooks/useWebSocket.ts` - Complete React hook with:
  - Socket.io-client integration
  - Auto-reconnection logic
  - Subscription management
  - Online user tracking
  - Event handling

### ✅ Job Queue System
- `src/lib/queue.ts` - BullMQ queue management:
  - 6 job queues (emails, SMS, Slack, reports, notifications, bulk operations)
  - Job creation methods
  - Progress tracking
  - Automatic retries with exponential backoff

### ✅ Job Worker Process
- `src/jobs/worker.ts` - Background job processor:
  - Email worker (TODO: Nodemailer integration)
  - SMS worker (TODO: Twilio integration)
  - Slack worker (TODO: Slack API integration)
  - Report generation worker
  - Bulk operation worker with WebSocket progress

### ✅ Supporting Services
- `src/lib/logger.ts` - Structured logging system
- `src/lib/redis.ts` - Redis connection management
- `src/app/api/socket.io/route.ts` - Socket.io API endpoint

### ✅ UI Components
- `src/components/realtime/RealtimeIndicator.tsx` - Real-time status indicators:
  - Connection status badge
  - Online user count
  - Bulk operation progress
  - Real-time toast notifications
  - Asset status animations

---

## ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                    Real-Time System                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  CLIENT (React)                  SERVER (Node.js)           │
│  ┌─────────────────┐             ┌─────────────────┐        │
│  │ useWebSocket    │──WebSocket──│ Socket.io       │        │
│  │ hook            │   (4.7.0)   │ Server          │        │
│  └─────────────────┘             └────────┬────────┘        │
│                                           │                 │
│  Real-time Components              Room Management         │
│  ├─ RealtimeIndicator             ├─ company:{id}          │
│  ├─ BulkOperationProgress         ├─ user:{id}             │
│  ├─ RealtimeToast                 ├─ assets:{id}           │
│  └─ AssetStatusBadge              ├─ notifications:{id}    │
│                                   └─ analytics:{id}        │
│                                                             │
│  Background Jobs              Redis Queue System           │
│  ├─ Email                     ├─ BullMQ 5.0.0             │
│  ├─ SMS                       ├─ ioredis 5.3.0            │
│  ├─ Slack                     ├─ Job Workers              │
│  ├─ Reports                   └─ Progress Tracking        │
│  └─ Bulk Operations                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## INSTALLATION & SETUP

### Step 1: Install Dependencies
```bash
npm install
```

This will install:
- `socket.io@^4.7.0` - WebSocket server
- `socket.io-client@^4.7.0` - WebSocket client
- `bullmq@^5.0.0` - Job queue
- `ioredis@^5.3.0` - Redis client
- `nodemailer@^6.9.7` - Email service
- `twilio@^4.10.0` - SMS service
- `@slack/web-api@^6.9.0` - Slack integration
- `pdfkit@^0.13.0` - PDF generation

### Step 2: Set Environment Variables
Create `.env.local`:
```env
# WebSocket
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Redis
REDIS_URL=redis://localhost:6379

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@assetmanagement.com

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Slack
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK
```

### Step 3: Start Redis
```bash
# Docker
docker run -d -p 6379:6379 redis:7-alpine

# Or using docker-compose
docker-compose up -d redis
```

### Step 4: Run Migrations
```bash
npm run db:migrate
npm run db:seed
```

---

## RUNNING THE SYSTEM

### Development Mode (3 Terminal Windows)

**Terminal 1: Next.js Server**
```bash
npm run dev
# Server runs on http://localhost:3000
```

**Terminal 2: Job Worker**
```bash
npm run jobs
# Processes background jobs from queues
```

**Terminal 3: Optional - Monitor Redis**
```bash
redis-cli monitor
# Watch Redis commands in real-time
```

### Production Mode
```bash
npm run build
npm start

# In separate process:
npm run jobs
```

---

## REAL-TIME EVENTS

### Asset Events
```typescript
// When asset is checked out
'asset:checked_out' → {
  assetId: string
  userId: string
  checkoutTime: Date
  expectedReturnDate: Date
  ...checkoutData
}

// When asset is checked in
'asset:checked_in' → {
  assetId: string
  userId: string
  checkinTime: Date
  actualCondition: string
  ...checkinData
}

// When asset is updated
'asset:updated' → {
  assetId: string
  action: 'created' | 'updated' | 'deleted'
  ...assetData
}
```

### Notification Events
```typescript
'notification:new' → {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  data: any
  timestamp: Date
}
```

### Analytics Events
```typescript
'analytics:updated' → {
  metrics: {
    totalAssets: number
    checkedOut: number
    maintenance: number
    ...
  }
  timestamp: Date
}
```

### Bulk Operation Events
```typescript
'bulk:operation_progress' → {
  operationId: string
  current: number
  total: number
  percentage: number
  status: 'in_progress' | 'completed' | 'failed'
  message: string
  timestamp: Date
}
```

### Presence Events
```typescript
'presence:user_online' → {
  userId: string
  timestamp: Date
  onlineCount: number
}

'presence:user_offline' → {
  userId: string
  timestamp: Date
  onlineCount: number
}
```

---

## CLIENT-SIDE USAGE

### Basic WebSocket Connection
```typescript
import { useWebSocket } from '@/hooks/useWebSocket'

function MyComponent() {
  const { connected, onlineUsers, emit, on, off } = useWebSocket({
    subscriptions: ['assets', 'notifications'],
    autoConnect: true,
  })

  useEffect(() => {
    const handleAssetUpdate = (data) => {
      console.log('Asset updated:', data)
    }

    on('asset:updated', handleAssetUpdate)

    return () => {
      off('asset:updated', handleAssetUpdate)
    }
  }, [on, off])

  return (
    <div>
      {connected ? 'Connected' : 'Offline'}
      {onlineUsers > 0 && `${onlineUsers} users online`}
    </div>
  )
}
```

### Real-Time Asset Updates
```typescript
import { useAssetUpdates } from '@/hooks/useWebSocket'

function AssetList() {
  const { updates } = useAssetUpdates(companyId)

  return (
    <div>
      {updates.map((update) => (
        <div key={update.assetId}>
          {update.assetId}: {update.action}
        </div>
      ))}
    </div>
  )
}
```

### Real-Time Analytics
```typescript
import { useAnalyticsUpdates } from '@/hooks/useWebSocket'

function Dashboard() {
  const { data, lastUpdate } = useAnalyticsUpdates(companyId)

  return (
    <div>
      <h2>Real-Time Metrics</h2>
      <p>Total Assets: {data?.metrics.totalAssets}</p>
      <p>Checked Out: {data?.metrics.checkedOut}</p>
      <p>Last Updated: {lastUpdate?.toLocaleTimeString()}</p>
    </div>
  )
}
```

### Real-Time Components
```typescript
import { RealtimeIndicator, BulkOperationProgress } from '@/components/realtime/RealtimeIndicator'

function Dashboard() {
  return (
    <div>
      <RealtimeIndicator showLabel={true} />

      <BulkOperationProgress
        progress={75}
        current={75}
        total={100}
        status="in_progress"
        message="Processing 75/100 items"
      />
    </div>
  )
}
```

---

## JOB QUEUE USAGE

### Queue Email
```typescript
import { queueEmail } from '@/lib/queue'

// In your API route
await queueEmail(
  'user@example.com',
  'Checkout Reminder',
  'checkout-reminder',
  {
    assetName: 'Laptop',
    returnDate: '2026-07-20',
    userName: 'John Doe',
  },
  { delay: 3600000 } // 1 hour delay
)
```

### Queue SMS
```typescript
import { queueSMS } from '@/lib/queue'

await queueSMS(
  '+1234567890',
  'Your asset checkout expires in 24 hours. Please return it ASAP.',
  { priority: 10 } // High priority
)
```

### Queue Slack Message
```typescript
import { queueSlackMessage } from '@/lib/queue'

await queueSlackMessage(
  '#assets',
  {
    text: 'New asset added',
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: '*New Asset*\nLaptop - HP XPS 15' },
      },
    ],
  }
)
```

### Queue Report Generation
```typescript
import { queueReport } from '@/lib/queue'

const job = await queueReport(
  'inventory',
  userId,
  companyId,
  { startDate: '2026-01-01', endDate: '2026-07-14' }
)

// Monitor progress
const status = await getJobStatus(reportQueue, job.id)
console.log(`Report: ${status.progress}% complete`)
```

### Queue Bulk Operation
```typescript
import { queueBulkOperation } from '@/lib/queue'

const job = await queueBulkOperation(
  'delete',
  'bulk-delete-op-123',
  userId,
  companyId,
  [{ id: 'asset-1' }, { id: 'asset-2' }, /* ... */]
)

// Job automatically broadcasts progress via WebSocket
```

---

## SERVER-SIDE BROADCASTING

### Broadcast Asset Update
```typescript
import { broadcastAssetUpdate } from '@/websocket/server'

// In your asset creation/update API route
await prisma.asset.create({ /* ... */ })

broadcastAssetUpdate(
  newAsset.id,
  { action: 'created', ...newAsset },
  companyId
)
```

### Broadcast Checkout Event
```typescript
import { broadcastAssetCheckout } from '@/websocket/server'

broadcastAssetCheckout(assetId, userId, checkoutData)
```

### Broadcast Analytics Update
```typescript
import { broadcastAnalyticsUpdate } from '@/websocket/server'

broadcastAnalyticsUpdate(companyId, {
  totalAssets: 500,
  checkedOut: 120,
  maintenance: 15,
  retired: 45,
})
```

### Send User Notification
```typescript
import { sendNotification } from '@/websocket/server'

sendNotification(userId, {
  title: 'Checkout Expired',
  message: 'Your asset checkout has expired',
  type: 'warning',
  data: { assetId, checkoutId },
})
```

---

## MONITORING & DEBUGGING

### Check Redis Connection
```bash
npm run dev

# In another terminal:
redis-cli ping
# Response: PONG
```

### View Job Queue Status
```bash
redis-cli
> KEYS bull:*
> GET bull:emails:1
```

### Monitor WebSocket Connections
```typescript
import { getConnectedUsers, getConnectedUserCount } from '@/websocket/server'

// In an API route
const users = getConnectedUsers(companyId)
const count = getConnectedUserCount(companyId)

console.log(`Company has ${count} connected users: ${users}`)
```

### View Job History
```typescript
import { getEmailQueue } from '@/lib/queue'
import { getJobStatus } from '@/lib/queue'

const queue = getEmailQueue()
const completedJobs = await queue.getCompleted()
const failedJobs = await queue.getFailed()

completedJobs.forEach((job) => {
  console.log(`Job ${job.id}: ${job.progress()}%`)
})
```

---

## ERROR HANDLING

### WebSocket Disconnection
```typescript
const { connected, error } = useWebSocket()

if (!connected) {
  return <OfflineMode /> // Show offline UI
}

if (error) {
  return <ErrorBanner message={error} /> // Show error
}
```

### Job Failures
Jobs automatically retry 3 times with exponential backoff:
```
Attempt 1: Immediate
Attempt 2: After 2 seconds
Attempt 3: After 4 seconds
Attempt 4: After 8 seconds
```

Failed jobs are logged in Redis and can be inspected:
```bash
redis-cli
> HGETALL bull:emails:failed
```

### Graceful Degradation
If Redis/WebSocket is unavailable:
1. Queue system queues jobs in-memory (during outage)
2. WebSocket falls back to long-polling
3. UI shows "Offline" mode
4. Operations continue when connection restored

---

## TESTING

### Test Real-Time Updates
```typescript
import { io } from 'socket.io-client'

const socket = io('http://localhost:3000/api/socket.io', {
  auth: {
    userId: 'test-user',
    companyId: 'test-company',
  },
})

socket.on('connect', () => {
  console.log('Connected!')
})

socket.on('asset:updated', (data) => {
  console.log('Asset update:', data)
})

socket.emit('subscribe:assets', { companyId: 'test-company' })
```

### Test Job Queue
```bash
# Add test job
redis-cli
> RPUSH bull:emails:1 '{"test":"data"}'

# Check job status
npm run jobs
# Watch for "Processing email job" log message
```

---

## NEXT STEPS

### Task 2C.2: Email & SMS Notifications (6 hours)
- [ ] Implement Nodemailer email service
- [ ] Implement Twilio SMS service
- [ ] Create email templates
- [ ] Build notification preferences UI
- [ ] Test email/SMS delivery

### Task 2C.3: Slack Integration (5 hours)
- [ ] Implement Slack API integration
- [ ] Create slash commands
- [ ] Add interactive buttons
- [ ] Build workspace connection UI

### Task 2C.4: PDF Reports (4 hours)
- [ ] Implement PDFKit report generation
- [ ] Create report templates
- [ ] Build report builder UI
- [ ] Add report scheduling

### Task 2C.5: Advanced RBAC (4 hours)
- [ ] Create custom roles system
- [ ] Implement permission matrix
- [ ] Add audit logging
- [ ] Build role management UI

---

## TROUBLESHOOTING

### WebSocket not connecting
1. Check Redis is running: `redis-cli ping`
2. Check environment variables: `echo $REDIS_URL`
3. Check browser console for errors
4. Verify Socket.io path: `/api/socket.io`

### Jobs not processing
1. Check job worker is running: `npm run jobs`
2. Check Redis queue: `redis-cli KEYS bull:*`
3. Check job worker logs for errors
4. Verify Redis connection in worker

### High memory usage
1. Clear old jobs: `npm run cleanup-jobs`
2. Reduce max connection pool size
3. Check for memory leaks in event handlers
4. Monitor WebSocket connections: `getConnectedUserCount()`

---

## PERFORMANCE OPTIMIZATION

### Reduce WebSocket Messages
- Batch updates every 100ms
- Only send changed fields
- Use room subscriptions efficiently
- Clean up event listeners

### Optimize Job Processing
- Use job delays for rate limiting
- Batch similar jobs
- Clear completed jobs regularly
- Monitor queue size

### Database Optimization
- Index frequently queried fields
- Use database connection pooling
- Cache read-heavy queries
- Avoid N+1 queries

---

## SECURITY CONSIDERATIONS

### WebSocket Security
- ✓ User authentication middleware
- ✓ Company-based room isolation
- ✓ Token validation
- ✓ Connection rate limiting (TODO)

### Job Queue Security
- ✓ Redis connection encryption (TODO)
- ✓ Job data sanitization
- ✓ Access control for job monitoring (TODO)

### API Security
- ✓ CORS validation
- ✓ Rate limiting (TODO)
- ✓ Input validation (TODO)

---

**Next Update**: After Task 2C.1 is tested and merged
**Estimated Completion**: 2026-07-24
