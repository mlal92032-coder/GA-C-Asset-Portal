# 🚀 Quick Start Guide

## ⚡ 5-Minute Setup

### 1️⃣ Start Docker Services (if not already running)
```powershell
# PostgreSQL
docker run --name postgres-asset-mgmt -e POSTGRES_PASSWORD=password -e POSTGRES_DB=asset_management -p 5432:5432 -d postgres:15

# Redis
docker run --name redis-asset-mgmt -p 6379:6379 -d redis:7
```

### 2️⃣ Run Setup Script
```powershell
# In project root
.\setup.ps1
```

### 3️⃣ Start Development Server
```powershell
npm run dev
```

### 4️⃣ Open Browser
Go to: **http://localhost:3001**

### 5️⃣ Login
```
Email:    admin@company.com
Password: admin123
```

---

## 📚 Default User Accounts

### Super Admin
- **Email:** admin@company.com
- **Password:** admin123
- **Role:** SUPER_ADMIN (Full access)

### IT Department (if seeded)
- **Email:** mustafa.qazi@sef.com
- **Password:** Admin@123456
- **Role:** IT Staff

- **Email:** khurram.jamal@sef.com
- **Password:** Admin@123456
- **Role:** IT Staff

---

## 🔧 Common Commands

```bash
# Development
npm run dev              # Start dev server

# Database
npm run db:migrate      # Run migrations
npm run db:seed         # Seed sample data
npm run db:studio       # Open Prisma Studio

# Testing
npm run test            # Run all tests
npm run test:unit       # Unit tests only
npm run test:integration # Integration tests

# Linting
npm run lint            # Check code style

# Production Build
npm run build           # Build for production
npm start               # Start production server

# Real-time Services
npm run ws              # WebSocket server
npm run jobs            # Background job worker
```

---

## 🌐 Application URLs

| Service | URL | Port |
|---------|-----|------|
| Web App | http://localhost:3001 | 3001 |
| WebSocket | ws://localhost:3001 | 3001 |
| Database | localhost | 5432 |
| Redis | localhost | 6379 |
| Prisma Studio | http://localhost:5555 | 5555 |

---

## 📦 Docker Commands

```powershell
# View running containers
docker ps

# View logs
docker logs postgres-asset-mgmt
docker logs redis-asset-mgmt

# Stop containers
docker stop postgres-asset-mgmt redis-asset-mgmt

# Remove containers
docker rm postgres-asset-mgmt redis-asset-mgmt

# Access PostgreSQL CLI
docker exec -it postgres-asset-mgmt psql -U postgres -d asset_management

# Access Redis CLI
docker exec -it redis-asset-mgmt redis-cli
```

---

## ✅ Verification Checklist

- [ ] Docker Desktop is running
- [ ] PostgreSQL container is running (port 5432)
- [ ] Redis container is running (port 6379)
- [ ] Dependencies installed (npm install)
- [ ] Database migrations run (npm run db:migrate)
- [ ] Database seeded (npm run db:seed)
- [ ] Dev server started (npm run dev)
- [ ] Can access http://localhost:3001
- [ ] Can login with admin@company.com / admin123

---

## 🛠️ Troubleshooting

### "Can't reach database server"
```powershell
# Check if PostgreSQL is running
docker ps | findstr postgres

# Start it if not running
docker run --name postgres-asset-mgmt -e POSTGRES_PASSWORD=password -e POSTGRES_DB=asset_management -p 5432:5432 -d postgres:15
```

### "Connection refused on port 3001"
```powershell
# Kill any process on that port
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Or use a different port
npm run dev -- -p 3002
```

### "Module not found errors"
```powershell
# Reinstall dependencies
rm -r node_modules package-lock.json
npm install
```

### Database migration errors
```powershell
# Reset database
npm run db:migrate reset

# Or manually
docker exec -it postgres-asset-mgmt psql -U postgres -d asset_management -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npm run db:migrate
```

---

## 📊 Features

✅ **Multi-Tenant Asset Management**
✅ **Real-time Notifications** (WebSocket)
✅ **Background Jobs** (BullMQ/Redis)
✅ **Advanced Reporting**
✅ **Role-Based Access Control**
✅ **Audit Logging**
✅ **Mobile Responsive**
✅ **Dark Mode Support**
✅ **Export to Excel/PDF**
✅ **QR Code Generation**

---

## 🚀 Deployment

### Vercel
See **VERCEL_DEPLOYMENT.md** for complete guide

### Docker
```bash
docker build -t asset-management .
docker run -p 3000:3000 asset-management
```

### Traditional Server
```bash
npm run build
npm start
```

---

## 📞 Support

- **Issues:** Check GitHub issues
- **Docs:** See README.md
- **Email:** support@assetmanagement.com

---

## 📝 License

MIT

---

**Happy Coding! 🎉**
