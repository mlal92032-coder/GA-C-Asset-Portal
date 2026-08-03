# Vercel Deployment Guide - Asset Management System

## 📋 Pre-Deployment Checklist

### 1. **Project Compatibility** ✅
- ✅ Next.js 14 (Latest compatible)
- ✅ Node.js 18+ required
- ✅ React 18+
- ✅ TypeScript
- ✅ Prisma ORM

**Current Project Status:** READY FOR VERCEL

---

## 🔧 Requirements for Vercel Deployment

### 1. **Vercel Account**
- Create free account at https://vercel.com
- Link GitHub account (recommended)
- Requires billing info (free tier available)

### 2. **Database** (PostgreSQL - REQUIRED)
Vercel doesn't include a built-in database. You need external:
- **Option A:** Vercel Postgres (Recommended)
- **Option B:** AWS RDS PostgreSQL
- **Option C:** Railway PostgreSQL
- **Option D:** Supabase PostgreSQL

### 3. **Environment Variables** (Will need to set in Vercel)
```
DATABASE_URL=postgresql://user:password@host:5432/asset_management
NEXTAUTH_SECRET=your-secret-key-here (32+ characters)
NEXTAUTH_URL=https://your-domain.com
NODE_ENV=production
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
REDIS_URL=redis://your-redis-host:6379 (optional for production)
```

### 4. **Build Requirements**
- Disk Space: 500MB minimum
- Build Time: ~3-5 minutes
- Memory: 512MB RAM (Vercel standard)

---

## 📝 Step-by-Step Deployment Process

### **STEP 1: Prepare Project for Production**

#### 1.1 Update Environment Variables
```bash
# Create .env.production file (DO NOT commit to git)
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=generate-long-random-string
NEXTAUTH_URL=https://your-domain-on-vercel.vercel.app
NODE_ENV=production
```

#### 1.2 Update next.config.js for Production
```javascript
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true, // For production
  },
  poweredByHeader: false, // Security
};
```

#### 1.3 Install Required Dependencies
```bash
npm install --save-exact
```

---

### **STEP 2: Set Up Database (Vercel Postgres)**

#### Option A: Using Vercel Postgres (EASIEST)

1. **Create Vercel Postgres Instance:**
   ```bash
   # In Vercel Dashboard:
   # Project → Storage → Create Database → Postgres
   ```

2. **Get Connection String:**
   - Copy connection string from Vercel Dashboard
   - It will be auto-added to .env.local as `POSTGRES_PRISMA_URL`

3. **Update DATABASE_URL:**
   ```
   DATABASE_URL=postgres://[user]:[password]@[host]/[database]
   ```

#### Option B: External Database (AWS RDS/Railway)

1. **Create PostgreSQL Database:**
   - Host: your-database-host.com
   - Port: 5432
   - Database: asset_management
   - Username: postgres
   - Password: strong-password

2. **Connection String Format:**
   ```
   DATABASE_URL=postgresql://postgres:password@host:5432/asset_management?sslmode=require
   ```

---

### **STEP 3: Prepare Database Schema**

#### 3.1 Generate Prisma Client
```bash
npx prisma generate
```

#### 3.2 Run Migrations (IMPORTANT)
```bash
# Generate first migration
npx prisma migrate deploy

# OR if migrations don't exist
npx prisma db push --skip-generate
```

---

### **STEP 4: Push Code to GitHub**

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Ready for Vercel deployment"

# Create repository on GitHub
# Then push:
git branch -M main
git remote add origin https://github.com/yourusername/asset-management.git
git push -u origin main
```

**.gitignore should include:**
```
node_modules/
.env
.env.local
.env.production
.next/
dist/
build/
*.log
```

---

### **STEP 5: Deploy to Vercel**

#### Method 1: Using Vercel Dashboard (EASIEST)

1. **Go to Vercel:** https://vercel.com

2. **Click "New Project"**

3. **Select "Import Git Repository"**
   - Select your GitHub repository
   - Click "Import"

4. **Configure Project:**
   - Framework: Next.js ✓
   - Root Directory: ./ (default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

5. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add each variable:
     ```
     DATABASE_URL = postgresql://...
     NEXTAUTH_SECRET = your-secret
     NEXTAUTH_URL = https://your-domain.vercel.app
     NODE_ENV = production
     JWT_SECRET = your-jwt-secret
     JWT_REFRESH_SECRET = your-refresh-secret
     ```

6. **Click "Deploy"**
   - Vercel will build and deploy (3-5 minutes)
   - You'll get a URL: `https://your-project.vercel.app`

#### Method 2: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Add environment variables when prompted
```

---

### **STEP 6: Database Initialization (CRITICAL)**

After first deployment, initialize database:

#### Option A: Using Vercel Functions (Recommended)

1. **Create `/api/db-init.ts`:**
```typescript
import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (req.query.key !== process.env.DB_INIT_KEY) return res.status(401).end();

  try {
    // Check if default tenant exists
    let tenant = await prisma.tenant.findFirst({
      where: { slug: 'default' }
    });

    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          name: 'Default Organization',
          slug: 'default',
          status: 'ACTIVE',
          tier: 'STANDARD',
          billingEmail: 'admin@example.com',
        }
      });
    }

    // Check if admin user exists
    let admin = await prisma.user.findFirst({
      where: { email: 'admin@example.com' }
    });

    if (!admin) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      admin = await prisma.user.create({
        data: {
          email: 'admin@example.com',
          fullName: 'System Administrator',
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          status: 'ACTIVE',
          tenantId: tenant.id,
        }
      });
    }

    res.status(200).json({ success: true, message: 'Database initialized' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

2. **Add to Environment Variables:**
   ```
   DB_INIT_KEY=super-secret-init-key-12345
   ```

3. **Run initialization:**
   ```bash
   curl -X POST https://your-project.vercel.app/api/db-init?key=super-secret-init-key-12345
   ```

#### Option B: Using Local Migration

```bash
# Before deployment
npx prisma migrate deploy

# Or after deployment via CLI
vercel env pull .env.local
npx prisma migrate deploy
```

---

### **STEP 7: Post-Deployment Verification**

#### 7.1 Check Deployment Status
```bash
# In Vercel Dashboard:
# - Go to Deployments tab
# - Check build logs
# - Verify "Production" badge
```

#### 7.2 Test Application
1. Visit your URL: `https://your-project.vercel.app`
2. Login with credentials:
   - Email: `admin@example.com`
   - Password: `admin123`
3. Test create/read operations
4. Verify dashboard loads

#### 7.3 Check Server Logs
```bash
# In Vercel Dashboard:
# - Select Deployment
# - Click "View Function Logs"
# - Check for errors
```

---

## 🚀 Production Optimization

### 1. **Database Connection Pool**
```
# Add to DATABASE_URL:
?schema=public&ssl=require&connection_limit=5
```

### 2. **Redis Cache (Optional)**
```
REDIS_URL=redis://your-redis-host:6379
```

### 3. **Rate Limiting**
```typescript
// Already configured in auth middleware
// Adjust in src/lib/rate-limiter.ts
```

### 4. **Image Optimization**
```javascript
// next.config.js
images: {
  unoptimized: true, // Safe for serverless
  domains: ['your-domain.com'],
}
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: Database Connection Error
```
Error: connect ECONNREFUSED
```
**Solution:**
- Verify DATABASE_URL is correct
- Check database is accessible from Vercel IPs
- Whitelist `0.0.0.0/0` in database security groups

### Issue 2: Build Fails
```
Error: Cannot find module '@prisma/client'
```
**Solution:**
```bash
npm install @prisma/client
npx prisma generate
git commit -am "Fix: regenerate Prisma"
git push origin main
# Vercel will auto-rebuild
```

### Issue 3: Environment Variables Not Loading
**Solution:**
- Redeploy after adding env vars: `vercel --prod`
- Check .env.production is not committed
- Verify variable names have no typos

### Issue 4: NextAuth Session Error
**Solution:**
```
# Generate 32+ character secret:
openssl rand -base64 32

# Add to Vercel:
NEXTAUTH_SECRET=generated-secret
NEXTAUTH_URL=https://your-domain.vercel.app
```

---

## 🔒 Security Checklist

- [ ] DATABASE_URL is secret (not in code)
- [ ] NEXTAUTH_SECRET is 32+ characters
- [ ] JWT secrets are strong
- [ ] .env files in .gitignore
- [ ] Database user has limited permissions
- [ ] CORS properly configured
- [ ] HTTPS enforced
- [ ] Rate limiting enabled
- [ ] Audit logging enabled

---

## 📊 Monitoring & Maintenance

### Daily Checks
- Monitor deployment logs
- Check error rates
- Verify database backups

### Weekly Tasks
- Review user activity
- Check performance metrics
- Update dependencies (npm audit)

### Monthly Tasks
- Database maintenance
- Security updates
- Performance optimization

---

## 🎯 Custom Domain Setup

1. **Buy Domain** (GoDaddy, Namecheap, etc.)
2. **In Vercel Dashboard:**
   - Project → Settings → Domains
   - Add domain
   - Follow DNS setup instructions
3. **Update Environment Variable:**
   ```
   NEXTAUTH_URL=https://your-custom-domain.com
   ```
4. **Redeploy:**
   ```bash
   vercel --prod
   ```

---

## 💰 Cost Estimation

| Service | Free Tier | Pro Tier |
|---------|-----------|----------|
| Vercel | 100 GB bandwidth/month | Pay as you go |
| PostgreSQL | $0-15/month | Starting $15/month |
| Redis | $0-7/month | Starting $7/month |
| **Total** | ~$15/month | ~$25-50/month |

---

## 📞 Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Vercel Support:** https://vercel.com/support

---

## ✅ Deployment Checklist Summary

- [ ] Project tested locally
- [ ] .env.production configured
- [ ] Database created & accessible
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables added
- [ ] Database initialized
- [ ] Login tested
- [ ] Assets displayed
- [ ] Custom domain configured (optional)
- [ ] Monitoring setup
- [ ] Backups configured

---

**Your project is production-ready!** 🎉
