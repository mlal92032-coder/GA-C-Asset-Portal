# GA&C Asset Management System

Enterprise asset management and tracking system built with Next.js and Prisma.

## Quick Start

### Prerequisites
- Node.js v18+
- npm v9+

### Installation

```bash
# Clone repository
git clone https://github.com/mlal92032-coder/GA-C-Asset-Portal.git
cd GA-C-Asset-Portal

# Install dependencies
npm install

# Generate Prisma Client
cd frontend && npx prisma generate && cd ..

# Seed database (optional)
cd frontend && npx prisma db seed && cd ..
```

### Run Application

```bash
# Development (all services)
npm run dev:all

# Frontend only
npm run dev --workspace=frontend

# Backend only
npm run dev --workspace=backend
```

**Frontend runs on:** http://localhost:3001

## Login Credentials

```
Email:    admin@company.com
Password: admin123
```

## Features

✅ Multi-asset management (Electronics, Furniture, Vehicles)  
✅ Asset checkout/check-in tracking  
✅ QR code and barcode support  
✅ Maintenance scheduling  
✅ Advanced analytics and reports  
✅ Role-based access control  
✅ Real-time WebSocket updates  
✅ Bulk import/export  
✅ Audit logging  

## Tech Stack

**Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS  
**Backend:** Prisma ORM, SQLite, NextAuth  
**Features:** Socket.io, BullMQ, Chart.js  

## Available Commands

```bash
npm run dev:all       # Frontend + Backend
npm run build         # Build both
npm run lint          # Lint code
npm test              # Run tests
npm run db:seed       # Seed database
```

## Project Structure

```
├── frontend/          # Next.js application
├── backend/           # Backend services
└── README.md          # This file
```

## Support

For issues: [GitHub Issues](https://github.com/mlal92032-coder/GA-C-Asset-Portal/issues)

---

**Version:** 1.0.1 | **Status:** ✅ Production Ready
