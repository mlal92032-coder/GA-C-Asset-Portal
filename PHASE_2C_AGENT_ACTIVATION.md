# Phase 2C Multi-Agent Activation Guide

**Status**: 🟢 READY FOR PARALLEL EXECUTION
**Activation Date**: 2026-07-14
**Orchestration Level**: Full multi-agent parallel work

---

## FOR DESIGN-UI-UX-BUILDER AGENT

### Your Role in Phase 2C
Build all user-facing interfaces for real-time features, notifications, reports, and role management.

### Timeline
- **Day 1-3 (2C.1 completion)**: Integrate real-time UI components
- **Day 4-8 (2C.2-2C.3 parallel)**: Build notification preferences & Slack UI
- **Day 9-10 (2C.4): Build** report builder interface
- **Day 11-12 (2C.5)**: Build role management dashboard

### Starting Now - 2C.1 UI Integration (2 hours)

#### Task: Integrate Real-Time Components into Dashboard

**Files to modify**:
1. `src/app/(dashboard)/dashboard/page.tsx` - Add RealtimeIndicator to header
2. `src/components/dashboard/MetricsCard.tsx` - Add real-time animations
3. `src/components/assets/AssetCard.tsx` - Add live status badges

**Components ready for use**:
```typescript
import { RealtimeIndicator, AssetStatusBadge } from '@/components/realtime/RealtimeIndicator'

// Usage:
<RealtimeIndicator showLabel={true} className="px-4 py-2" />
<AssetStatusBadge status="CHECKED_OUT" isUpdating={true} />
```

**Requirements**:
- ✓ Show connection status in dashboard header
- ✓ Display online user count
- ✓ Animate asset status changes
- ✓ Show real-time metric updates
- ✓ Mobile responsive design

**Testing**:
1. Open dashboard in 2 browsers
2. Trigger asset checkout in one
3. Verify instant update in other
4. Verify mobile layout works

---

### Upcoming - 2C.2 Notification Preferences UI (3 hours)

#### Task: Build Notification Settings Panel

**Component to build**: `src/components/notifications/NotificationPreferences.tsx`

**Features**:
```typescript
interface NotificationPreferences {
  // Channels
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  
  // Frequency
  frequency: 'immediate' | 'daily' | 'weekly'
  
  // Per-notification type
  checkoutAlerts: boolean
  maintenanceAlerts: boolean
  assetStatusChanges: boolean
  lowStockAlerts: boolean
  bulkOperationUpdates: boolean
}
```

**UI Layout**:
```
Settings Page
├─ Notification Channels
│  ├─ ☐ Email
│  ├─ ☐ SMS  
│  ├─ ☐ Push
│  └─ Frequency: [Immediate] [Daily] [Weekly]
├─ Notification Types
│  ├─ ☑ Checkout Alerts
│  ├─ ☑ Maintenance Alerts
│  ├─ ☐ Asset Status Changes
│  ├─ ☑ Low Stock Alerts
│  └─ ☑ Bulk Operation Updates
└─ [Save Preferences]
```

**API Endpoint**: `PATCH /api/settings/notifications`

**Testing**:
- Save preferences
- Verify they persist
- Toggle each option
- Verify real-time updates

---

### Upcoming - 2C.3 Slack Integration UI (1 hour)

#### Task: Build Slack Workspace Connection UI

**Component**: `src/components/integrations/SlackConnect.tsx`

**Features**:
```
Slack Integration Panel
├─ Connection Status: [Not Connected] / [Connected to @workspace]
├─ [Connect to Slack] button
├─ Channel Routing Configuration
│  ├─ Assets Updates → #assets
│  ├─ Maintenance Alerts → #maintenance
│  ├─ Audit Log → #audit
│  └─ Bulk Operations → #operations
└─ Commands Help: /asset /maintenance /alert
```

**Requirements**:
- OAuth2 connection flow
- Channel selector
- Disconnect button
- Command reference

---

### Upcoming - 2C.4 Report Builder UI (3 hours)

#### Task: Build Drag-Drop Report Builder

**Components**:
- `src/components/reports/ReportBuilder.tsx`
- `src/components/reports/ReportPreview.tsx`
- `src/components/reports/ReportScheduler.tsx`

**Features**:
```
Report Builder
├─ Report Type Selector
│  ├─ Inventory Report
│  ├─ Maintenance Report
│  ├─ Financial Report
│  └─ Custom Report
├─ Metrics Selection (drag-drop)
│  └─ [Total Assets] [Checked Out] [Maintenance] ...
├─ Filters
│  ├─ Date Range: [Start] - [End]
│  ├─ Asset Type: [All] [Furniture] [Electronics] [Vehicles]
│  └─ Location: [Select...]
├─ Preview (animated)
├─ Format: [PDF] [Excel]
└─ Schedule: [One-time] [Daily] [Weekly]
```

**Animations**:
- Smooth metric card animations
- Chart rendering transitions
- PDF generation progress
- Report list loading states

---

### Upcoming - 2C.5 Role Management Dashboard (2 hours)

#### Task: Build Custom Roles Interface

**Components**:
- `src/components/admin/RoleManager.tsx`
- `src/components/admin/PermissionMatrix.tsx`
- `src/components/admin/RoleAudit.tsx`

**Features**:
```
Admin Dashboard → Roles
├─ Roles List
│  ├─ Admin (built-in)
│  ├─ Manager (built-in)
│  ├─ Employee (built-in)
│  ├─ [+ Create Custom Role]
│  └─ Custom Role 1
│     └─ [Edit] [Delete] [Members]
├─ Create Role Dialog
│  ├─ Role Name: [________]
│  ├─ Description: [________________]
│  ├─ Permissions Matrix
│  │  ├─ Assets: [View] [Create] [Edit] [Delete]
│  │  ├─ Maintenance: [View] [Create] [Edit] [Delete]
│  │  ├─ Checkout: [View] [Create] [Return]
│  │  ├─ Reports: [View] [Generate] [Schedule]
│  │  └─ Settings: [View] [Edit]
│  └─ [Create] [Cancel]
└─ Audit Log
   └─ Who changed what when
```

---

## FOR CODE-REVIEWER AGENT

### Your Role in Phase 2C
Ensure security, performance, and code quality across all integrations.

### Review Focus Areas

#### Immediate (2C.1 Review)
1. **WebSocket Security**
   - Review: `src/websocket/server.ts`
   - Check: User auth middleware, room isolation, token validation
   - Test: Try to access other company's rooms, invalid tokens

2. **Job Queue Security**
   - Review: `src/lib/queue.ts`, `src/jobs/worker.ts`
   - Check: Job data sanitization, credential handling, error logging
   - Test: Queue sensitive data, verify no leaks in logs

3. **Type Safety**
   - Review: All TypeScript interfaces
   - Check: No `any` types, strict null checks
   - Test: Run `npm run lint`

4. **Performance**
   - Review: Connection pooling, memory management
   - Check: Event listener cleanup, connection limits
   - Test: Monitor memory with 100+ concurrent users

#### Upcoming (2C.2-2C.5)
- Email/SMS credential security
- Slack API token handling
- PDF generation timeouts
- Permission system authorization

### Review Checklist Template

```typescript
// Code Review Checklist for Phase 2C Tasks

✅ **Security**
  - [ ] No credentials in code
  - [ ] CORS configured correctly
  - [ ] Rate limiting in place
  - [ ] Input validation complete
  - [ ] No SQL injection risks
  
✅ **Performance**
  - [ ] No N+1 queries
  - [ ] Connection pooling used
  - [ ] Memory leaks prevented
  - [ ] Proper cleanup on disconnect
  
✅ **Code Quality**
  - [ ] TypeScript strict mode
  - [ ] Proper error handling
  - [ ] Comprehensive logging
  - [ ] Comments on complex logic
  
✅ **Testing**
  - [ ] Unit tests included
  - [ ] Integration tests included
  - [ ] Error cases handled
  - [ ] Edge cases considered
```

### Review Commands
```bash
# Code quality check
npm run lint
npm run build
npm run test

# Type checking
npx tsc --noEmit

# Security scan
npm audit
npx snyk test
```

---

## FOR EXPLORE AGENT (On-Demand)

### Research Tasks Available

#### For Phase 2C.2 (Email & SMS)
- Nodemailer setup with Gmail/SendGrid
- Twilio SMS pricing and rate limits
- Email template best practices
- Unsubscribe link compliance (CAN-SPAM, GDPR)

#### For Phase 2C.3 (Slack)
- Slack API rate limits and quotas
- Slash command best practices
- Interactive button handling
- OAuth2 workspace connection

#### For Phase 2C.4 (PDF Reports)
- PDFKit advanced features
- Chart.js server-side rendering
- PDF file optimization
- Report pagination strategies

#### For Phase 2C.5 (RBAC)
- Permission matrix patterns
- Role-based access control best practices
- Audit logging strategies
- Field-level encryption options

---

## EXECUTION STRATEGY

### Daily Standup Template
```
Daily Standup - Phase 2C

What was completed:
- ✓ Task X: Completed
- ✓ Task Y: Completed

What's being worked on:
- → Task Z: In progress (50%)

Blockers:
- ⚠️ Waiting for: Redis setup

Next steps:
- Start: Next task
- Deadline: Tomorrow EOD
```

### Merge Request Process
```
Before Creating PR:
1. ✓ Code tested locally
2. ✓ npm run lint passes
3. ✓ npm run build succeeds
4. ✓ npm run test passes
5. ✓ Documentation updated

PR Description:
- What changed
- Why it changed
- How to test
- Related tasks
- Screenshots (if UI)

Review Checklist:
- [ ] Code quality OK
- [ ] Security OK
- [ ] Performance OK
- [ ] Tests OK
- [ ] Documentation OK
```

---

## COORDINATION BETWEEN AGENTS

### Communication Protocol
1. **Daily Updates**: Share progress via commit messages
2. **Blockers**: Note in commit descriptions
3. **Dependencies**: Call out in PR descriptions
4. **Questions**: Add comments to related files

### Dependency Chain
```
2C.1 (WebSocket) ← Foundation for all
  ↓
2C.2 (Email/SMS) ← Uses queue system
  ↓ (parallel)
2C.3 (Slack) ← Uses queue system
  ↓ (parallel)
2C.4 (PDF Reports) ← Uses queue system
  ↓
2C.5 (RBAC) ← Integrates with all
```

### File Ownership
- **advanced-software-builder**: Backend, queues, WebSocket
- **design-ui-ux-builder**: React components, UI/UX
- **code-reviewer**: Security, performance, tests
- **Explore agent**: Research, documentation

---

## TESTING STRATEGY

### Pre-Integration Testing
```bash
# Each agent should test their work:

# Backend (advanced-software-builder)
npm run dev          # Start Next.js
npm run jobs         # Start worker
redis-cli monitor    # Watch Redis

# UI (design-ui-ux-builder)
npm run dev
# Open in browser, test component interactions
# Test in 2+ browsers for real-time sync

# Security (code-reviewer)
npm run lint
npm audit
npx tsc --noEmit
```

### Integration Testing
```bash
# Full stack test
1. Start Redis: docker run -d -p 6379:6379 redis:7-alpine
2. Terminal 1: npm run dev
3. Terminal 2: npm run jobs
4. Browser 1 & 2: Test real-time updates
5. Verify: Logs show no errors
```

### Load Testing (Future)
```bash
# After Phase 2C complete
k6 run load-test.js
# Verify: 1000+ concurrent users
```

---

## COMMON ISSUES & SOLUTIONS

### Redis Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:6379

Solution:
1. Start Redis: docker run -d -p 6379:6379 redis:7-alpine
2. Verify: redis-cli ping → PONG
3. Check: echo $REDIS_URL
```

### WebSocket Not Connecting
```
Error: WebSocket connection failed

Solution:
1. Check browser console for errors
2. Verify: Socket.io path is /api/socket.io
3. Check: User auth token valid
4. Restart: npm run dev
```

### Job Not Processing
```
Error: Job stuck in queue

Solution:
1. Verify: npm run jobs is running
2. Check: redis-cli LLEN bull:emails
3. Verify: Worker logs for errors
4. Clear queue: npm run cleanup-jobs
```

---

## RESOURCES & DOCUMENTATION

### Must Read
1. **PHASE_2C_ORCHESTRATION.md** - Master plan
2. **PHASE_2C_IMPLEMENTATION_GUIDE.md** - Technical guide
3. **PHASE_2C_STATUS_REPORT.md** - Current status
4. **This file** - Agent coordination

### Reference Docs
- WebSocket API: Socket.io docs
- Job Queue: BullMQ docs
- PDF: PDFKit docs
- Slack: Slack API docs
- Twilio: Twilio docs

### Source Code Files
- Backend: `src/websocket/`, `src/lib/queue.ts`, `src/jobs/`
- Frontend: `src/hooks/useWebSocket.ts`, `src/components/realtime/`
- Config: `package.json`, `.env.local`

---

## SUCCESS CRITERIA FOR HANDOFF

### Phase 2C Complete When
- ✓ All 5 tasks (2C.1-2C.5) implemented
- ✓ All tests passing
- ✓ Security audit complete
- ✓ Performance benchmarks met
- ✓ Documentation updated
- ✓ All agents sign off

### Deliverables
- ✓ Production-ready code
- ✓ Comprehensive test suite
- ✓ User documentation
- ✓ API documentation
- ✓ Deployment guide
- ✓ Security report

---

## NEXT PHASE (Phase 3)

After Phase 2C completion, ready for:
- Advanced analytics and reporting
- AI/ML integration
- Mobile app optimization
- Advanced compliance features

---

**Orchestration Status**: 🟢 ACTIVE
**Expected Completion**: 2026-07-24
**Progress**: Phase 2C.1 ✓ | 2C.2-2C.5 Ready to Start

**Questions?** Check documentation or raise issue.
