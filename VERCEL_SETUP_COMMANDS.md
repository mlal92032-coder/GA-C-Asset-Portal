# 🚀 Vercel Deployment - Command Guide

Your code is pushed to GitHub. Now follow these steps to deploy with database.

---

## STEP 1: Create Database on Vercel (10 minutes)

**Choose Option A (Easiest) or Option B:**

### Option A: Vercel Postgres (RECOMMENDED)

1. Go to: https://vercel.com/dashboard
2. Select your project: **GA-C-Asset-Portal**
3. Click **Storage** tab (left sidebar)
4. Click **Create Database** button
5. Select **Postgres**
6. Fill form:
   - Database Name: `asset-management-db`
   - Region: Select closest to your users (for Pakistan, choose Europe)
   - Click **Create**

7. **Vercel automatically adds these to Environment Variables:**
   - `POSTGRES_URL` ← Copy this value
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`

### Option B: Neon (Alternative - Free 3GB)

1. Go to: https://neon.tech
2. Create free project
3. Copy connection string that looks like:
   ```
   postgresql://user:password@...neon.tech/neondb?sslmode=require
   ```

---

## STEP 2: Add Environment Variables to Vercel (5 minutes)

1. Go to: https://vercel.com/dashboard
2. Select project **GA-C-Asset-Portal**
3. Click **Settings** (top menu)
4. Click **Environment Variables** (left sidebar)
5. Add these variables:

```
DATABASE_URL = [Paste from database above]

NEXTAUTH_SECRET = [Generate: openssl rand -base64 32]
NEXTAUTH_URL = https://YOUR-PROJECT-NAME.vercel.app

NEXT_PUBLIC_API_URL = https://YOUR-PROJECT-NAME.vercel.app/api
NEXT_PUBLIC_BASE_URL = https://YOUR-PROJECT-NAME.vercel.app

JWT_SECRET = [Generate: openssl rand -base64 32]
JWT_REFRESH_SECRET = [Generate: openssl rand -base64 32]

ENABLE_BACKGROUND_JOBS = false
ENABLE_WEBSOCKET = false
ENABLE_EMAIL_QUEUE = false

NODE_ENV = production
```

### To Generate Secrets (Windows PowerShell):
```powershell
# Run this in PowerShell:
$bytes = New-Object byte[] 24
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$secret = [Convert]::ToBase64String($bytes)
Write-Output $secret
```

Copy output → Paste into NEXTAUTH_SECRET field
Repeat 2 more times for JWT_SECRET and JWT_REFRESH_SECRET

---

## STEP 3: Deploy to Vercel (Automatic)

Vercel auto-deploys when code is on GitHub.

**Check deployment status:**
1. Go to: https://vercel.com/dashboard
2. Select **GA-C-Asset-Portal**
3. Watch **Deployments** tab for build progress

**Your app will be at:**
```
https://GA-C-Asset-Portal.vercel.app
```
(Vercel shows actual URL during deployment)

---

## STEP 4: Run Database Migrations (5 minutes)

After deployment succeeds, run migrations:

```bash
# In PowerShell (from project folder):
vercel env pull
npx prisma db push
```

This creates database schema on Vercel Postgres.

---

## STEP 5: Test Your App (5 minutes)

1. Visit your Vercel URL (example: `https://GA-C-Asset-Portal.vercel.app`)
2. Login with admin credentials:
   - Email: `admin@company.com`
   - Password: `Admin@123`
3. Test features:
   - ✅ Dashboard loads
   - ✅ Assets display
   - ✅ Search works
   - ✅ PDF export works
   - ✅ QR codes generate

---

## If Something Goes Wrong

### Build Failed?
1. Check Vercel Dashboard → Deployments → View build logs
2. Common issues:
   - DATABASE_URL missing → Add to Environment Variables
   - Node version mismatch → Set NODE_VERSION=18 in env vars
   - Dependencies missing → Delete node_modules locally and npm install

### Database Connection Failed?
1. Verify DATABASE_URL is correct in Environment Variables
2. Check if database is running in Storage tab
3. Ensure POSTGRES_URL is copied exactly (no extra spaces)

### App Loads But No Data?
1. Database exists but not seeded
2. Run migrations: `npx prisma db push`
3. Check browser console for errors (F12)

---

## Vercel Dashboard Checklist

- [ ] Database created in Storage tab
- [ ] Environment variables added (DATABASE_URL, secrets, flags)
- [ ] Code deployed (Deployments shows green checkmark)
- [ ] Domain working (visit your URL)
- [ ] Login successful
- [ ] Dashboard data loading

---

## Timeline

| Step | Time | Status |
|------|------|--------|
| Create Database | 10 min | ← START HERE |
| Add Environment Variables | 5 min | |
| Deploy (auto) | 3 min | |
| Run Migrations | 5 min | |
| Test App | 5 min | |
| **TOTAL** | **~30 min** | |

---

## Quick Summary

```bash
# Your code is already on GitHub!
# Now just need to:

1. vercel.com/dashboard → Create Postgres Database
2. Copy DATABASE_URL from Vercel
3. Add environment variables in Vercel Settings
4. Vercel auto-deploys when it detects your repo
5. Run: vercel env pull && npx prisma db push
6. Visit your live URL!
```

**You're ready to deploy! 🚀**
