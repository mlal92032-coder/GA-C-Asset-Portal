# Phase 2C: Advanced Integrations Orchestration Plan

**Status**: Starting NOW (2026-07-14)
**Estimated Duration**: 20-25 hours
**Team**: Multi-agent parallel execution

---

## PHASE 2C OBJECTIVES

Build enterprise-grade integrations across 5 major systems:
1. **Real-time WebSocket updates** (6 hours)
2. **Email & SMS notifications** (6 hours)
3. **Slack integration** (5 hours)
4. **Advanced PDF reports** (4 hours)
5. **Advanced Role-Based Access Control** (4 hours)

---

## CURRENT CODEBASE STATE

### ✅ What's Already Built
- **WebSocket Infrastructure**: `useWebSocket` hook skeleton exists, ready for completion
- **Real-time Services**: 
  - `RealtimeSyncService` (async broadcast methods)
  - `WebSocketService` (notification/asset/checkout methods)
  - Service integration points ready
- **Package Dependencies**: 
  - `socket.io` (4.7.0) - installed
  - `bullmq` (5.0.0) - installed
  - `ioredis` (5.3.0) - installed
  - `pdfkit` (0.13.0) - installed
  - `nodemailer` (in deps check) - needed
  - `twilio` - needed
  - `@slack/web-api` - needed

### ⚠️ What's Missing
- WebSocket server implementation (`src/websocket/server.ts`)
- WebSocket request handler (`src/app/api/socket.io/route.ts`)
- Job worker system (`src/jobs/worker.ts`)
- Email queue system
- SMS queue system
- Notification preferences UI
- Slack webhook handlers
- PDF report builders
- Custom roles system

---

## MULTI-AGENT EXECUTION STRATEGY

### Primary Agent: advanced-software-builder (this agent)
**Responsible for**:
- Architecture design and integration patterns
- Core WebSocket server implementation
- Queue system design (BullMQ)
- Email/SMS service architecture
- Slack API integration
- Permission system design

### Secondary Agents (parallel work)
1. **design-ui-ux-builder** → UI for notifications, reports, roles
2. **code-reviewer** → Security, performance, type safety
3. **Explore agent** (on-demand) → SDK research, API docs

---

## TASK 2C.1: WebSocket Real-Time Updates (6 hours)

### Deliverables
1. ✅ WebSocket server (`src/websocket/server.ts`)
2. ✅ Socket.io API route (`src/app/api/socket.io/route.ts`)
3. ✅ Real-time checkout/checkin notifications
4. ✅ Dashboard metrics real-time sync
5. ✅ Bulk operation progress streaming
6. ✅ Reconnection & fallback handling
7. ✅ Mobile responsive WebSocket handling

### Key Features
```
Real-time Events:
- asset:checked_out → Notifies all users
- asset:checked_in → Updates asset status
- asset:updated → Syncs across browsers
- dashboard:metrics_updated → Animates charts
- bulk:operation_progress → Shows progress bar
- bulk:operation_complete → Shows completion toast
```

### Success Criteria
- ✓ 2+ browser windows see instant updates
- ✓ Dashboard metrics animate on change
- ✓ Bulk operations show real-time progress
- ✓ Automatic reconnect after disconnection
- ✓ Fallback to polling if WebSocket fails
- ✓ Zero memory leaks on reconnect
- ✓ Works on mobile devices

---

## TASK 2C.2: Email & SMS Notifications (6 hours)

### Deliverables
1. ✅ Notification queue system (BullMQ)
2. ✅ Email service (Nodemailer)
3. ✅ SMS service (Twilio)
4. ✅ Email templates (HTML)
5. ✅ User notification preferences UI
6. ✅ Notification history tracking
7. ✅ Unsubscribe links & management

### Notification Types
```
Email:
- Checkout expiry reminders (24h, 1h before)
- Maintenance task assignments
- Asset status changes (admin)
- Bulk operation completions
- Low stock alerts

SMS:
- Urgent maintenance alerts
- Checkout overdue reminders
- System alerts (admin)

User Preferences:
- Channel: Email/SMS/Toast
- Frequency: Immediate/Daily/Weekly
- Per-notification-type opt-in/out
```

### Success Criteria
- ✓ Emails send on checkout expiry
- ✓ SMS sends on urgent alerts
- ✓ User can customize per notification
- ✓ Notification history stored in DB
- ✓ Unsubscribe links work
- ✓ Professional HTML templates

---

## TASK 2C.3: Slack Integration (5 hours)

### Deliverables
1. ✅ Slack webhook notifications
2. ✅ Channel routing (#assets, #maintenance, #audit, #operations)
3. ✅ Slack slash commands
4. ✅ Interactive buttons/actions
5. ✅ Workspace connection UI
6. ✅ Error handling & fallback

### Slack Features
```
Channels:
- #assets → Asset updates
- #maintenance → Maintenance alerts
- #audit → User activity
- #operations → Bulk operations

Commands:
- /asset search [name] → Search assets
- /asset status [id] → Get status
- /maintenance pending → List pending
- /alert [type] → Get alerts

Actions:
- "Approve" button → Approve maintenance
- "Reject" button → Reject requests
- "View Details" → Link to web UI
```

### Success Criteria
- ✓ Notifications post to correct channels
- ✓ Slash commands respond correctly
- ✓ Interactive buttons work
- ✓ User can connect workspace
- ✓ Graceful error handling

---

## TASK 2C.4: Advanced PDF Reports (4 hours)

### Deliverables
1. ✅ Asset inventory reports
2. ✅ Maintenance history reports
3. ✅ Financial/depreciation reports
4. ✅ Custom report builder UI
5. ✅ Report scheduling (auto-email)
6. ✅ Chart rendering in PDFs

### Report Types
```
Inventory Reports:
- Full asset list with photos
- Asset valuation summary
- Condition breakdown charts
- Location distribution

Maintenance Reports:
- History timeline
- Cost analysis by asset/type
- Preventive vs corrective breakdown
- Maintenance schedule forecast

Financial Reports:
- Depreciation calculations
- Total asset value trends
- Cost per asset type
- Budget vs actual spending

Custom Reports:
- Drag-drop report builder
- Choose metrics, date ranges, filters
- Save as templates
- Schedule auto-email
```

### Success Criteria
- ✓ PDFs generate without errors
- ✓ Charts render correctly
- ✓ Custom reports work
- ✓ Scheduled reports email automatically
- ✓ Professional formatting

---

## TASK 2C.5: Advanced RBAC (4 hours)

### Deliverables
1. ✅ Custom role creation system
2. ✅ Granular permission matrix
3. ✅ Field-level visibility control
4. ✅ Permission audit logging
5. ✅ Role-based API middleware
6. ✅ Permission management UI

### Permission Model
```
Custom Roles:
- Create roles with specific permissions
- Granular control: view, create, edit, delete
- Role-based field visibility
- Custom approval workflows

Permission Matrix:
- Define approval hierarchies
- Define data visibility
- Field-level permissions (salary, budget)
- Action-level permissions

Audit:
- Log who accessed what
- Log permission changes
- Detect unusual patterns
```

### Success Criteria
- ✓ Custom roles can be created
- ✓ Permissions enforced on all pages
- ✓ Field-level filtering works
- ✓ Audit logs track access
- ✓ No unauthorized data access
- ✓ Performance not impacted

---

## EXECUTION TIMELINE

### Day 1-3 (Monday-Wednesday): Task 2C.1 WebSocket
- **Advanced Builder**: Core WebSocket server + Socket.io setup
- **Design UI/UX**: Real-time UI indicators + progress animations
- **Code Reviewer**: Security + performance review
- **Estimate**: 6 hours

### Day 4-6 (Thursday-Saturday): Task 2C.2 Email/SMS
- **Advanced Builder**: BullMQ queue + Nodemailer + Twilio setup
- **Design UI/UX**: Notification preferences UI
- **Code Reviewer**: Email security + template validation
- **Estimate**: 6 hours

### Day 7-8 (Sunday-Monday): Task 2C.3 Slack
- **Advanced Builder**: Slack API + slash commands + actions
- **Design UI/UX**: Slack workspace connection UI
- **Code Reviewer**: API security + webhook validation
- **Estimate**: 5 hours

### Day 9-10 (Tuesday-Wednesday): Task 2C.4 PDF Reports
- **Advanced Builder**: PDFKit report generation + templates
- **Design UI/UX**: Report builder UI + drag-drop
- **Code Reviewer**: PDF quality + chart validation
- **Estimate**: 4 hours

### Day 11-12 (Thursday-Friday): Task 2C.5 RBAC
- **Advanced Builder**: Permission system + middleware
- **Design UI/UX**: Role management UI
- **Code Reviewer**: Security + permission audit
- **Estimate**: 4 hours

---

## CRITICAL DEPENDENCIES & MILESTONES

### Dependency Chain
```
2C.1 (WebSocket) - Foundation
  ↓
2C.2 (Email/SMS) - Uses WebSocket for delivery confirmation
  ↓
2C.3 (Slack) - Parallel with 2C.2
  ↓
2C.4 (PDF Reports) - Parallel with 2C.3
  ↓
2C.5 (RBAC) - Integrates with all previous systems
```

### Blocking Milestones
1. ✓ WebSocket server fully operational (2C.1 complete)
2. ✓ Queue system functional (needed for 2C.2 & 2C.3)
3. ✓ API security patterns established (needed for 2C.5)

---

## TECH STACK DECISIONS

### WebSocket Implementation
- **Library**: Socket.io 4.7.0 (already installed)
- **Server**: Node.js HTTP server with Socket.io
- **Client**: Socket.io-client in React
- **Fallback**: Long-polling if WebSocket fails
- **Rooms**: Per-company isolation, per-user notifications

### Queue System
- **Library**: BullMQ 5.0.0 (already installed)
- **Backend**: Redis via ioredis 5.3.0 (already installed)
- **Jobs**: Email, SMS, Slack, Report generation
- **Retry**: Exponential backoff, max 3 retries

### Notification Services
- **Email**: Nodemailer (SMTP)
- **SMS**: Twilio API
- **Slack**: @slack/web-api
- **Storage**: PostgreSQL notifications table

### PDF Generation
- **Library**: PDFKit 0.13.0 (already installed)
- **Charts**: Chart.js server-side rendering
- **Storage**: S3 or local file system

### Authentication & RBAC
- **Auth**: NextAuth (already in use)
- **Roles**: Custom Prisma model for roles
- **Permissions**: Database-driven matrix
- **Middleware**: Express-like permission checker

---

## GOTCHAS & RISKS

### High Risk
- ⚠️ WebSocket memory leaks with many concurrent connections
- ⚠️ Email delivery failures (rate limiting, spam)
- ⚠️ Slack API rate limiting (600 requests/min)
- ⚠️ Permission system complexity (easy to create security holes)

### Medium Risk
- ⚠️ PDF generation timeout on large reports
- ⚠️ Queue job loss if Redis crashes
- ⚠️ Cross-origin WebSocket issues

### Mitigation
- Implement connection pooling + monitoring
- Add retry logic + dead letter queues
- Use rate limiting middleware
- Comprehensive permission auditing
- Health checks for all external services

---

## SUCCESS METRICS

By end of Phase 2C:
- ✓ Real-time updates working across 2+ browser windows
- ✓ Email notifications delivering 95%+ success rate
- ✓ SMS notifications for urgent alerts working
- ✓ Slack notifications routing correctly to channels
- ✓ PDF reports generating < 5 seconds for typical data
- ✓ Custom roles preventing unauthorized access
- ✓ Zero security vulnerabilities in permission system
- ✓ All features tested and documented
- ✓ Ready for production deployment

---

## NEXT STEPS

1. ✅ Initialize WebSocket server structure (this agent)
2. ✅ Create Job worker scaffold (this agent)
3. ✅ Set up Redis connection pooling (this agent)
4. ✅ Create API routes for WebSocket
5. ✅ Begin 2C.1 implementation (this agent starts now)
6. → Alert design-ui-ux-builder for 2C.1 UI work
7. → Alert code-reviewer for initial review

---

**ACTIVATION**: Full multi-agent orchestration begins NOW on Task 2C.1 (WebSocket Real-Time Updates)
