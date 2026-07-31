# Vercel Deployment Guide - Asset Management System

## 📋 Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Step-by-Step Deployment](#step-by-step-deployment)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Troubleshooting](#troubleshooting)
6. [Post-Deployment](#post-deployment)

---

## ✅ Pre-Deployment Checklist

### Project Compatibility Status
- ✅ Next.js 14 (Vercel Compatible)
- ✅ TypeScript (Supported)
- ✅ Tailwind CSS (Native Support)
- ✅ Prisma ORM (Supported)
- ❌ **WebSocket Server** (NOT supported on Vercel Pro)
- ❌ **Background Jobs/Worker** (NOT supported on Vercel Pro)
- ⚠️ **Local File Storage** (Not recommended - use cloud storage)

### Required Services Before Deployment

1. **PostgreSQL Database**
   - [ ] Choose: Railway, Neon, Supabase, or AWS RDS
   - [ ] Create database
   - [ ] Get connection string

2. **Redis Cache**
   - [ ] Choose: Upstash, Railway, or AWS ElastiCache
   - [ ] Get connection string

3. **Email Service** (Optional but recommended)
   - [ ] Mailgun, SendGrid, or Mailtrap
   - [ ] Get SMTP credentials

4. **GitHub Repository**
   - [ ] Push code to GitHub
   - [ ] Make sure .env files are in .gitignore

---

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Repository

```bash
# 1. Initialize git if not already done
git init

# 2. Create .gitignore (ensure sensitive files are ignored)
# Important lines:
.env
.env.local
.env.*.local
node_modules/
.next/
dist/

# 3. Commit your code
git add .
git commit -m "Prepare for Vercel deployment"

# 4. Push to GitHub
git push -u origin main
```

### Step 2: Create PostgreSQL Database

**Using Railway (Recommended):**
```
1. Go to https://railway.app
2. Sign up with GitHub
3. Create new project → PostgreSQL
4. Copy database URL
5. Note: Format is postgresql://user:password@host:port/database
```

**Using Neon (Also Good):**
```
1. Go to https://neon.tech
2. Sign up with GitHub
3. Create new project
4. Copy connection string
```

### Step 3: Create Redis Instance

**Using Upstash:**
```
1. Go to https://upstash.com
2. Sign up with GitHub
3. Create Redis database
4. Copy REST URL
5. Vercel has native Upstash integration
```

### Step 4: Setup Vercel Project

```bash
# Install Vercel CLI (optional)
npm i -g vercel

# OR deploy via web:
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Import Project"
4. Select your repository
5. Click Import
```

### Step 5: Configure Environment Variables in Vercel

In Vercel Dashboard → Settings → Environment Variables

Add these variables:

```
# Database
DATABASE_URL = postgresql://user:password@host:5432/database

# Redis
REDIS_URL = redis://default:password@host:port

# NextAuth
NEXTAUTH_SECRET = <generate-new-secure-key>
NEXTAUTH_URL = https://your-domain.vercel.app

# Public URLs
NEXT_PUBLIC_API_URL = https://your-domain.vercel.app/api
NEXT_PUBLIC_BASE_URL = https://your-domain.vercel.app

# JWT
JWT_SECRET = <secure-random-key>
JWT_REFRESH_SECRET = <secure-random-key>

# Email (optional)
SMTP_HOST = smtp.mailtrap.io (or your provider)
SMTP_PORT = 587
SMTP_USER = your_email
SMTP_PASSWORD = your_password
EMAIL_FROM = noreply@yourdomain.com

# Logging
LOG_LEVEL = info
NODE_ENV = production
```

### Step 6: Build Configuration

Vercel automatically detects Next.js, but verify:

**Build Settings in Vercel:**
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm ci`
- Start Command: `npm start`

---

## ⚙️ Environment Configuration

### Generate Secure NEXTAUTH_SECRET

```bash
# Run in your terminal
openssl rand -base64 32

# Or use Node:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Create Production .env File

Create ``.env.production` locally (don't commit):

```env
# Production Database
DATABASE_URL=postgresql://user:password@host:port/database

# Production Redis
REDIS_URL=redis://user:password@host:port

# NextAuth
NEXTAUTH_SECRET=<your-generated-secret>
NEXTAUTH_URL=https://yourdomain.vercel.app

# URLs
NEXT_PUBLIC_API_URL=https://yourdomain.vercel.app/api
NEXT_PUBLIC_BASE_URL=https://yourdomain.vercel.app

# JWT
JWT_SECRET=<your-generated-secret>
JWT_REFRESH_SECRET=<your-generated-secret>

# Email
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your_email@mailtrap.io
SMTP_PASSWORD=your_password

# Environment
NODE_ENV=production
LOG_LEVEL=info
```

---

## 🗄️ Database Setup

### Run Migrations on Vercel

After first deployment, run migrations:

```bash
# Option 1: Via Vercel CLI
vercel env pull  # Pull environment variables
npx prisma migrate deploy

# Option 2: Via Vercel Dashboard
1. Go to Deployments → Select latest
2. Click "Functions" → Choose any API route
3. Check deployment logs for migration status
```

### Seed Database (Optional)

If you have seed data:

```bash
npx prisma db seed
```

### Database Models Included

Your Prisma schema includes:
- **Tenant** (Multi-tenancy support)
- **User** (Auth users)
- **Roles & Permissions**
- **Assets** (Vehicles, Equipment, etc.)
- **Audit Logs**
- **Notifications**
- **Reports**

Total: 40+ tables

---

## ⚠️ Known Limitations & Solutions

### Issue 1: WebSocket Server (NOT SUPPORTED)

**Problem:** `src/websocket/server.ts` won't work on Vercel Pro

**Solutions:**
1. **Remove WebSocket** (Recommended for MVP)
   ```bash
   rm src/websocket/server.ts
   ```

2. **Deploy separately** to Railway/Heroku
   ```bash
   # Create separate Railway service for WebSocket
   ```

3. **Use Vercel Enterprise** ($$$)

### Issue 2: Background Jobs (NOT SUPPORTED)

**Problem:** `src/jobs/worker.ts` and BullMQ won't work

**Solutions:**
1. **Remove jobs** for MVP
2. **Use Vercel Functions** with cron (limited)
3. **Deploy separately** to Railway/Heroku
4. **Use external service**: Bull Board, Render.com

### Issue 3: Local File Uploads

**Problem:** `/public/uploads` won't persist on Vercel (serverless)

**Solution:** Migrate to cloud storage

```bash
# Install S3 client
npm install @aws-sdk/client-s3

# Or use Cloudinary (easier)
npm install next-cloudinary
```

Update upload handler to use cloud service.

### Issue 4: Environment Variables Size

**Problem:** Vercel has 4KB limit per env var

**Solutions:**
- Break large configs into smaller pieces
- Use JSON for complex objects
- Reference external config services

---

## 🧪 Testing Before Deployment

### Local Production Build

```bash
# Build locally
npm run build

# Start production server
npm start

# Test at http://localhost:3000
```

### Test Checklist

- [ ] Login works
- [ ] Dashboard loads
- [ ] Create asset succeeds
- [ ] Export to PDF works
- [ ] API endpoints respond
- [ ] Database queries work
- [ ] Email sending works (if enabled)
- [ ] No console errors

---

## 🔍 Troubleshooting

### Build Fails

**Check:**
```bash
# Run locally first
npm run build

# Check for TypeScript errors
npm run lint

# Verify all imports
```

### 500 Error After Deployment

```bash
# Check Vercel logs
vercel logs <deployment-url>

# Check function logs
# Vercel Dashboard → Deployments → Functions
```

### Database Connection Failed

**Verify:**
```bash
# Check DATABASE_URL is correct format
postgresql://user:password@host:port/database

# Test connection locally
npx prisma db execute --stdin < test.sql

# Check Prisma Client cache
rm -rf node_modules/.prisma
npm install
```

### WebSocket Errors

**Expected:** Will fail on Vercel Pro
**Fix:** Remove or deploy separately

### Redis Connection Issues

```bash
# Verify REDIS_URL format
redis://user:password@host:port

# Check Upstash credentials
# Dashboard → Verify REST API works
```

---

## ✨ Post-Deployment

### Domain Setup

```bash
# In Vercel Dashboard:
1. Settings → Domains
2. Add custom domain
3. Add DNS records
4. Verify domain
```

### Monitor Performance

- Vercel Analytics
- Web Vitals tracking
- Error tracking (Sentry integration)

### Enable Security Features

```
1. HSTS Header: Automatic on Vercel
2. CSP: Add in next.config.js
3. Rate Limiting: Implement in API routes
4. DDoS Protection: Automatic on Vercel
```

### Backup Strategy

```bash
# Regular database backups
# Most services (Railway, Neon) do automatic backups

# Manual backup:
pg_dump postgresql://... > backup.sql

# Schedule backup job on external service
```

### Monitoring & Alerts

Set up alerts for:
- Database CPU/Memory
- API error rates
- Slow API responses
- Failed deployments

---

## 📞 Support & Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Railway Docs:** https://docs.railway.app
- **Neon Docs:** https://neon.tech/docs

---

## 🎯 Deployment Summary

| Step | Status | Duration |
|------|--------|----------|
| Setup PostgreSQL | ⏳ Pending | 5 min |
| Setup Redis | ⏳ Pending | 5 min |
| Connect GitHub | ⏳ Pending | 2 min |
| Configure Env Vars | ⏳ Pending | 5 min |
| Deploy on Vercel | ⏳ Pending | 3-5 min |
| Run Migrations | ⏳ Pending | 2 min |
| Test on Production | ⏳ Pending | 10 min |
| **Total Time** | | **~40 min** |

---

**Next Steps:**
1. Create PostgreSQL database
2. Create Redis instance
3. Push code to GitHub
4. Deploy on Vercel
5. Configure environment variables
6. Run migrations

Good luck! 🚀
