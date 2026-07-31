# 🚀 Vercel Deployment Guide

## Prerequisites
- GitHub account with repository pushed
- Vercel account (free tier works)
- PostgreSQL database (cloud-hosted, e.g., Railway, Supabase, PlanetScale)
- Redis instance (cloud-hosted, e.g., Railway, Upstash, Redis Cloud)

---

## Step 1: Prepare Database & Services

### Option A: Using Railway (Recommended)
1. Go to https://railway.app
2. Create account and new project
3. Add PostgreSQL plugin
4. Add Redis plugin
5. Copy connection URLs

### Option B: Using Supabase (PostgreSQL only)
1. Go to https://supabase.com
2. Create new project
3. Get connection string from Settings > Database
4. For Redis, use Railway or Upstash

### Option C: Using Upstash (Redis)
1. Go to https://upstash.com
2. Create Redis database
3. Copy Redis URL

---

## Step 2: Push to GitHub

```bash
cd C:\Users\Hp\asset-management

# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: Asset Management System"

# Add remote (replace with your GitHub repo)
git remote add origin https://github.com/YOUR_USERNAME/asset-management.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Vercel

### Method 1: Using Vercel Dashboard (Easiest)
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Select your GitHub repository
4. Configure project:
   - Framework: Next.js
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: .next

5. Add Environment Variables:
   ```
   DATABASE_URL = your_postgresql_url
   REDIS_URL = your_redis_url
   JWT_SECRET = generate_random_32_char_string
   JWT_REFRESH_SECRET = generate_random_32_char_string
   ENCRYPTION_KEY = generate_random_32_char_string
   NODE_ENV = production
   API_BASE_URL = https://your-vercel-domain.vercel.app
   ALLOWED_ORIGINS = https://your-vercel-domain.vercel.app
   ```

6. Click "Deploy"

### Method 2: Using Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add DATABASE_URL
vercel env add REDIS_URL
vercel env add JWT_SECRET
vercel env add JWT_REFRESH_SECRET
vercel env add ENCRYPTION_KEY
vercel env add NODE_ENV production
vercel env add API_BASE_URL https://your-project.vercel.app
vercel env add ALLOWED_ORIGINS https://your-project.vercel.app

# Deploy production
vercel --prod
```

---

## Step 4: Database Migration on Vercel

After deployment, run migrations:

```bash
# Using Vercel CLI
vercel env pull

# Option 1: Run migration locally (if you have access to prod DB)
DATABASE_URL=your_prod_url npm run db:migrate

# Option 2: Run via Vercel function
# Create a deployment trigger that runs migrations
```

Or create a one-time migration script:
```bash
# scripts/migrate-prod.ts
import { execSync } from 'child_process';

const migrationCmd = `DATABASE_URL=${process.env.DATABASE_URL} npx prisma migrate deploy`;
console.log('Running migrations...');
execSync(migrationCmd, { stdio: 'inherit' });
```

---

## Step 5: Configure Custom Domain (Optional)

1. In Vercel Dashboard → Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

---

## Environment Variables Checklist

- [ ] DATABASE_URL (PostgreSQL connection string)
- [ ] REDIS_URL (Redis connection string)
- [ ] JWT_SECRET (32+ characters, random)
- [ ] JWT_REFRESH_SECRET (32+ characters, random)
- [ ] ENCRYPTION_KEY (32 characters, random)
- [ ] NODE_ENV=production
- [ ] API_BASE_URL (your Vercel domain)
- [ ] ALLOWED_ORIGINS (your Vercel domain)

---

## Generate Secure Secrets

```bash
# Use Node.js to generate secure random strings
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run this 3 times to get JWT_SECRET, JWT_REFRESH_SECRET, and ENCRYPTION_KEY.

---

## Troubleshooting

### "Can't reach database server"
- Check DATABASE_URL is correct
- Verify database is running and accessible
- Check firewall rules allow Vercel IPs

### "Redis connection failed"
- Check REDIS_URL is correct
- Verify Redis instance is running
- Check connection permissions

### "Database migration failed"
- Run migrations manually before deployment
- Check .env variables are set correctly
- Review prisma/migrations folder

### "Build fails"
- Clear .next cache: `rm -rf .next`
- Rebuild locally first: `npm run build`
- Check Node version compatibility

---

## Monitoring & Logs

1. **Vercel Dashboard**: View real-time logs
2. **Sentry** (Optional): Add error tracking
3. **LogRocket** (Optional): Add session replay

```bash
# To add Sentry
npm install @sentry/nextjs

# Configure in next.config.js
```

---

## Rollback Deployment

If something breaks:
1. Go to Vercel Dashboard → Deployments
2. Find previous stable deployment
3. Click "Promote to Production"

---

## Performance Tips

1. Enable caching in Vercel settings
2. Use ISR (Incremental Static Regeneration)
3. Optimize images with Next.js Image component
4. Consider CDN for static assets
5. Use database connection pooling

---

## Security Best Practices

✅ Never commit .env files
✅ Use strong JWT secrets (32+ chars)
✅ Enable HTTPS (automatic on Vercel)
✅ Set rate limiting
✅ Implement CORS correctly
✅ Use database SSL connections
✅ Rotate secrets regularly

---

## Support

For more help:
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs
