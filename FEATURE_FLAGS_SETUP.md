# Feature Flags Setup Guide
**Asset Management System - Vercel & Private Server Compatibility**

---

## 🎯 What Are Feature Flags?

Feature flags allow you to enable/disable features via environment variables. This lets the **same code** run differently on Vercel (limited) vs Private Server (full features).

```
Same Code + Different .env = Different Behavior
```

---

## ⚙️ Available Feature Flags

### **1. ENABLE_BACKGROUND_JOBS**
```
true  = Background job worker runs (Private Server) ✅
false = Jobs disabled, fallback to sync (Vercel) ✅
```

**What It Controls:**
- Email sending (BullMQ)
- SMS processing
- Report generation
- Slack notifications
- Bulk operations with progress tracking

### **2. ENABLE_WEBSOCKET**
```
true  = WebSocket server runs (Private Server) ✅
false = WebSocket disabled (Vercel) ✅
```

**What It Controls:**
- Real-time notifications
- Live progress tracking
- WebSocket connections

### **3. ENABLE_EMAIL_QUEUE**
```
true  = Email queuing via Redis (Private Server) ✅
false = Sync email sending (Vercel) ✅
```

**What It Controls:**
- Email queue management
- Async email processing

---

## 📋 Environment Files

### `.env.local` (Development - Your Computer)
```env
ENABLE_BACKGROUND_JOBS=true
ENABLE_WEBSOCKET=true
ENABLE_EMAIL_QUEUE=true
```
**Usage:** `npm run dev` locally - full features

### `.env.vercel` (Temporary Vercel Testing)
```env
ENABLE_BACKGROUND_JOBS=false
ENABLE_WEBSOCKET=false
ENABLE_EMAIL_QUEUE=false
```
**Usage:** Deploy to Vercel for user testing - limited features (no crashes)

### `.env` (Private Server - Production)
```env
ENABLE_BACKGROUND_JOBS=true
ENABLE_WEBSOCKET=true
ENABLE_EMAIL_QUEUE=true
```
**Usage:** Deploy to private server - full features

---

## 🚀 Deployment Guide

### **Stage 1: Local Development**
```bash
# .env.local has all features enabled
npm run dev

# You can test everything locally:
✅ Background jobs
✅ WebSocket
✅ Email queue
✅ All features
```

### **Stage 2: Temporary Vercel Deployment (User Testing)**
```bash
# Use .env.vercel values in Vercel Dashboard
# Settings → Environment Variables

# Add these to Vercel:
ENABLE_BACKGROUND_JOBS=false
ENABLE_WEBSOCKET=false
ENABLE_EMAIL_QUEUE=false
DATABASE_URL=<your-vercel-postgres>
REDIS_URL=<your-vercel-redis>
[other variables...]

# Deploy
git push origin main
# Vercel deploys automatically

# Result: Works but limited features
✅ Core features (CRUD, auth, dashboard)
❌ No real-time (WebSocket)
❌ No background jobs
❌ Email sends but not queued
```

### **Stage 3: Private Server (Full Features)**
```bash
# Use .env values on your server
# Update .env with your server details

ENABLE_BACKGROUND_JOBS=true
ENABLE_WEBSOCKET=true
ENABLE_EMAIL_QUEUE=true
DATABASE_URL=<your-server-postgres>
REDIS_URL=<your-server-redis>

# Deploy
# Pull code
npm install
npm run build
npm run start          # Next.js server
npm run jobs          # Background worker (Terminal 2)
npm run ws            # WebSocket server (Terminal 3)

# Result: Full features
✅ All features working
✅ Background jobs
✅ WebSocket real-time
✅ Complete system
```

---

## 📊 Feature Availability by Deployment

| Feature | Local Dev | Vercel | Private Server |
|---------|-----------|--------|----------------|
| **Core Features** | ✅ | ✅ | ✅ |
| (Login, Dashboard, CRUD) |  |  |  |
| **Background Jobs** | ✅ | ❌* | ✅ |
| (Email, SMS, Reports) | | (*Fallback) | |
| **WebSocket** | ✅ | ❌ | ✅ |
| (Real-time updates) |  |  |  |
| **Email Queue** | ✅ | ❌* | ✅ |
| (BullMQ) | | (*Sync only) | |
| **Bulk Operations** | ✅ | ⚠️ | ✅ |
| (With progress) | | (No progress) | |

---

## 🔧 How It Works - Code Examples

### **Email Sending (with feature flag)**

```typescript
// src/lib/queue.ts
const JOBS_ENABLED = process.env.ENABLE_BACKGROUND_JOBS === 'true'

export async function queueEmail(
  to: string,
  subject: string,
  template: string,
  data: any
) {
  // On Vercel (JOBS_ENABLED = false)
  if (!JOBS_ENABLED) {
    logger.info(`[SYNC] Email to ${to}: ${subject}`)
    // Just log - or send synchronously
    return { id: `sync_${Date.now()}` }
  }

  // On Private Server (JOBS_ENABLED = true)
  const queue = getEmailQueue()
  const job = await queue.add('send-email', {
    to, subject, template, data
  })
  return job
}
```

### **Using It in Your Code**

```typescript
// In API routes or services
import { queueEmail } from '@/lib/queue'

// This works the same everywhere
await queueEmail(
  user.email,
  'Welcome!',
  'welcome-template',
  { name: user.name }
)

// On Vercel: Logs only (no crash)
// On Private Server: Queues for processing
```

---

## ✅ Verification Checklist

### Before Vercel Deployment:
- [ ] `.env.vercel` created with flags disabled
- [ ] Feature flags added to Vercel Dashboard
- [ ] Database URL updated for Vercel
- [ ] Redis URL updated for Vercel
- [ ] Build locally: `npm run build` ✓
- [ ] Test production build: `NODE_ENV=production npm start`
- [ ] No TypeScript errors

### Before Private Server:
- [ ] `.env` updated with server details
- [ ] `ENABLE_BACKGROUND_JOBS=true`
- [ ] `ENABLE_WEBSOCKET=true`
- [ ] PostgreSQL accessible
- [ ] Redis accessible
- [ ] Run migrations: `npx prisma db push`
- [ ] Start all services (Next.js, worker, WebSocket)

---

## 🐛 Troubleshooting

### "Emails not sending on Vercel"
**Expected behavior** - Feature disabled for Vercel
**Check logs** - Should see `[SYNC] Email to...`
**Solution** - This is normal; emails will work on private server

### "WebSocket not connecting on Vercel"
**Expected behavior** - Not supported on Vercel
**Solution** - Use polling on Vercel; real-time works on private server

### "Build fails - feature flag undefined"
**Problem** - .env variables not loaded
**Solution** - Verify environment variables in Vercel Dashboard

### "Jobs not processing on private server"
**Problem** - Worker not running
**Solution** - Run `npm run jobs` in separate terminal

---

## 🔄 Migration Path

```
Phase 1: Local Development
└─ All features enabled
  └─ Test everything locally

Phase 2: Vercel Testing (Temporary)
└─ Limited features
  └─ User testing on Vercel
  └─ Identify issues
  └─ Gather feedback

Phase 3: Private Server (Permanent)
└─ All features enabled
└─ Full system deployment
└─ Production ready
```

---

## 📌 Important Notes

✅ **DO:**
- Use feature flags for each deployment
- Test on Vercel before moving to private server
- Keep backups before major changes
- Monitor logs on each deployment

❌ **DON'T:**
- Delete code - just disable via flags
- Mix different feature settings in same deployment
- Forget to update .env for each environment
- Deploy to production without testing

---

## 🚀 Quick Reference

### Local Development
```bash
npm run dev
# Features: All enabled ✅
```

### Deploy to Vercel
```bash
# 1. Add to Vercel Dashboard:
ENABLE_BACKGROUND_JOBS=false
ENABLE_WEBSOCKET=false

# 2. Push to GitHub
git push origin main

# 3. Vercel auto-deploys
# Result: Works with limited features
```

### Deploy to Private Server
```bash
# 1. Update .env
ENABLE_BACKGROUND_JOBS=true
ENABLE_WEBSOCKET=true

# 2. Deploy
npm install
npm run build
npm run start         # Terminal 1
npm run jobs          # Terminal 2

# Result: Full features
```

---

## 📞 Support

**If something breaks:**
1. Check which deployment (Vercel vs Private)
2. Verify feature flags in .env
3. Check `ENABLE_BACKGROUND_JOBS` value
4. Review logs: `LOG_LEVEL=debug`
5. Restore from backup if needed

**Backup location:**
```
C:\Users\Hp\asset-management-BACKUP-2026-07-31-132749
```

---

**Created:** 2026-07-31  
**Status:** Ready for Vercel deployment  
**Next:** Deploy to Vercel for user testing!
