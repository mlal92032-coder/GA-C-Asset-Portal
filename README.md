# GA&C Asset Portal - Enterprise Asset Management System

A comprehensive enterprise-level asset management system built with Next.js 14, React, and Prisma ORM for tracking and managing organizational assets efficiently.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Default Credentials](#default-credentials)
- [API Documentation](#api-documentation)
- [Database](#database)
- [Development](#development)

## ✨ Features

### Asset Management
- **Multi-Asset Support**: Manage Electronics, Furniture, and Vehicles
- **QR Code Generation**: Generate and scan QR codes for asset tracking
- **Barcode Support**: Print and scan barcodes for quick identification
- **Bulk Operations**: Bulk import, export, update, and delete assets
- **Asset History**: Complete audit trail of all asset movements and changes

### Checkout System
- **Asset Checkout/Check-in**: Track who has what asset and when
- **Checkout History**: View complete checkout timeline
- **Status Tracking**: Real-time asset status updates

### Maintenance Management
- **Maintenance Scheduling**: Schedule and track maintenance tasks
- **Maintenance History**: Complete maintenance records
- **Automated Alerts**: Get notified when maintenance is due

### Analytics & Reports
- **Dashboard Metrics**: Key performance indicators and statistics
- **Advanced Analytics**: Cost analysis, depreciation tracking
- **Custom Reports**: Generate PDF reports with filters
- **Data Visualization**: Interactive charts and graphs

### User Management
- **Role-Based Access**: SUPER_ADMIN, ADMIN, USER roles
- **User Permissions**: Granular permission control
- **Department Tracking**: Organize users by department
- **Status Management**: Active/Inactive user management

### Real-time Features
- **WebSocket Support**: Real-time asset status updates
- **Live Notifications**: Instant notifications for important events
- **Presence Indicators**: See who's currently online

### Security & Compliance
- **NextAuth Integration**: Secure authentication with JWT
- **Audit Logging**: Complete audit trail of all actions
- **Password Encryption**: bcryptjs for secure password hashing
- **Data Validation**: Zod schemas for type-safe data validation

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **React Query** - Data fetching and caching
- **React Hook Form** - Efficient form handling
- **Zod** - Schema validation

### Backend
- **Prisma ORM** - Database management
- **SQLite** - Development database (dev.db)
- **NextAuth.js** - Authentication
- **Socket.io** - Real-time communication
- **BullMQ** - Job queue system
- **Chart.js** - Data visualization

### Development Tools
- **ESLint** - Code linting
- **Jest** - Testing framework
- **Axios** - HTTP client

## 📦 Prerequisites

Before getting started, ensure you have:

- **Node.js** v18 or higher
- **npm** v9 or higher (or yarn)
- **Git**

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/mlal92032-coder/GA-C-Asset-Portal.git
cd GA-C-Asset-Portal
```

### 2. Install Dependencies

Install all dependencies for the monorepo:

```bash
npm install
```

This will install dependencies for both frontend and backend workspaces.

### 3. Generate Prisma Client

```bash
cd frontend
npx prisma generate
cd ..
```

### 4. Seed the Database (Optional)

To populate the database with sample data and default admin user:

```bash
cd frontend
npx prisma db seed
cd ..
```

## 🎯 Running the Application

### Start Development Server

Run both frontend and backend in development mode:

```bash
npm run dev:all
```

Or run them separately:

**Frontend Only:**
```bash
npm run dev --workspace=frontend
```
- Runs on `http://localhost:3001`

**Backend Only:**
```bash
npm run dev --workspace=backend
```

### Build for Production

Build both frontend and backend:

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

## 📁 Project Structure

```
GA-C-Asset-Portal/
├── frontend/                      # Next.js 14 Frontend Application
│   ├── app/                       # Next.js App Router
│   │   ├── api/                   # API routes (73+ endpoints)
│   │   ├── dashboard/             # Dashboard page
│   │   ├── assets/                # Asset management pages
│   │   ├── admin/                 # Admin pages
│   │   └── login/                 # Authentication pages
│   ├── components/                # React components (69+ components)
│   ├── hooks/                     # Custom React hooks
│   ├── lib/                       # Utility functions and libraries
│   ├── services/                  # Business logic services
│   ├── prisma/                    # Prisma schema and migrations
│   ├── public/                    # Static files
│   ├── tailwind.config.js         # Tailwind configuration
│   ├── tsconfig.json              # TypeScript configuration
│   └── package.json               # Frontend dependencies
│
├── backend/                       # Express.js Backend Application
│   ├── src/                       # Source code
│   ├── prisma/                    # Prisma schema
│   ├── package.json               # Backend dependencies
│   └── .env.example               # Environment variables template
│
├── package.json                   # Root monorepo configuration
└── README.md                      # This file
```

## 🔐 Default Credentials

After seeding the database, you can use these credentials:

### Admin Account
```
Email:    admin@company.com
Password: admin123
Role:     SUPER_ADMIN
```

### Test Users
```
Manager Account
- Email:    manager@company.com
- Password: user123
- Role:     USER

Employee Accounts
- Email:    alice@company.com / bob@company.com
- Password: user123
- Role:     USER
```

## 📡 API Documentation

### API Endpoints Overview

The application provides 73+ API endpoints across multiple domains:

#### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/session` - Get current session
- `POST /api/auth/signout` - User logout

#### Users
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `GET /api/users/[id]` - Get user details
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

#### Assets
- `GET /api/assets` - List all assets
- `POST /api/assets` - Create asset
- `GET /api/assets/[id]` - Get asset details
- `PUT /api/assets/[id]` - Update asset
- `DELETE /api/assets/[id]` - Delete asset
- `POST /api/assets/bulk-import` - Bulk import assets
- `POST /api/assets/bulk-export` - Bulk export assets
- `POST /api/assets/checkout` - Checkout asset
- `POST /api/assets/checkin` - Check-in asset

#### Electronics
- `GET /api/electronics` - List electronics
- `POST /api/electronics` - Create electronic item
- `GET /api/electronics/[id]` - Get details
- `PUT /api/electronics/[id]` - Update item
- `DELETE /api/electronics/[id]` - Delete item

#### Furniture
- `GET /api/furniture` - List furniture
- `POST /api/furniture` - Create furniture item
- `GET /api/furniture/[id]` - Get details
- `PUT /api/furniture/[id]` - Update item
- `DELETE /api/furniture/[id]` - Delete item

#### Vehicles
- `GET /api/vehicles` - List vehicles
- `POST /api/vehicles` - Create vehicle
- `GET /api/vehicles/[id]` - Get details
- `PUT /api/vehicles/[id]` - Update vehicle
- `DELETE /api/vehicles/[id]` - Delete vehicle

#### Dashboard
- `GET /api/dashboard/stats` - Get statistics
- `GET /api/dashboard/metrics` - Get key metrics
- `GET /api/dashboard/trends` - Get trends data

#### Reports
- `GET /api/reports/templates` - List report templates
- `POST /api/reports/generate` - Generate custom report

#### QR Codes
- `GET /api/qr/[assetId]` - Get QR code
- `GET /api/qr/[assetId]/verify` - Verify QR code

#### More Endpoints
- Maintenance Management
- Checkout History
- Audit Logs
- Notifications
- Settings & Preferences
- And many more...

## 💾 Database

### Database Type
- **Development**: SQLite (file-based, stored in `frontend/prisma/dev.db`)
- **Production**: Configure in `.env` file

### Prisma Migrations

Apply migrations:
```bash
cd frontend
npx prisma migrate dev
```

View database:
```bash
cd frontend
npx prisma studio
```

### Database Tables

- **Users** - User accounts and profiles
- **Companies** - Organization data
- **Locations** - Physical locations/offices
- **Manufacturers** - Equipment manufacturers
- **ElectronicAssets** - Computer, peripherals, etc.
- **FurnitureAssets** - Desks, chairs, cabinets, etc.
- **VehicleAssets** - Cars, motorcycles, etc.
- **CheckoutHistory** - Asset assignment records
- **MaintenanceRecords** - Service and maintenance logs
- **AuditLogs** - System activity logs
- **Notifications** - User notifications
- **Reports** - Generated reports
- **Attachments** - File uploads

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev                    # Run frontend only
npm run dev:all              # Run frontend & backend
npm run dev --workspace=frontend   # Frontend dev server
npm run dev --workspace=backend    # Backend dev server

# Building
npm run build                 # Build both frontend and backend

# Production
npm start                     # Start production server

# Database
npm run db:migrate            # Run Prisma migrations
npm run db:seed              # Seed database with sample data

# Real-time Features
npm run ws                    # Start WebSocket server
npm run jobs                  # Start background job queue

# Quality
npm run lint                  # Run ESLint
npm test                     # Run all tests
npm run test:unit            # Run unit tests only

# Setup
npm run setup                # Fresh install + database seed
```

### Environment Variables

Create `.env.local` file in the frontend directory:

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3001"

# API
NEXT_PUBLIC_API_URL="http://localhost:3001"

# Optional Services
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-password"

SLACK_BOT_TOKEN="your-slack-token"
```

### Code Style

- Use TypeScript for type safety
- Follow ESLint rules
- Use React hooks for state management
- Organize components by feature
- Use Tailwind CSS utility classes

### Testing

Run tests:
```bash
npm test
```

Run specific test file:
```bash
npm test -- user.test.ts
```

Run tests in watch mode:
```bash
npm test -- --watch
```

## 🐛 Troubleshooting

### Port 3000 Already in Use
The application will automatically use port 3001 if 3000 is taken.

### Prisma Client Error
If you see "Prisma Client initialization failed", run:
```bash
cd frontend
npx prisma generate
```

### Database Lock
If you get a database lock error, delete `.prisma/client` and regenerate:
```bash
cd frontend
rm -rf node_modules/.prisma
npx prisma generate
```

### Module Not Found Errors
Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📝 Git Workflow

### Commit Changes
```bash
git add .
git commit -m "feat: your feature description"
git push origin main
```

### Branch Naming
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code refactoring

## 📄 License

This project is proprietary software owned by Sindh Education Foundation.

## 👥 Team

**Developed by:** Claude Code AI Assistant  
**Project:** GA&C Asset Management Portal  
**Version:** 1.0.1

## 📞 Support

For issues or questions:
- Email: support@assetmanagement.com
- GitHub Issues: [Report an issue](https://github.com/mlal92032-coder/GA-C-Asset-Portal/issues)

## 🚀 Deployment

### Deploy Frontend (Vercel/Netlify)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy with `npm run build`

### Deploy Backend (Heroku/Railway)
1. Set up PostgreSQL database
2. Configure environment variables
3. Deploy with Node.js buildpack

### Docker (Optional)
Build and run with Docker:
```bash
docker build -t asset-portal .
docker run -p 3001:3001 asset-portal
```

## 🎉 Getting Started Quick Guide

```bash
# 1. Clone
git clone https://github.com/mlal92032-coder/GA-C-Asset-Portal.git
cd GA-C-Asset-Portal

# 2. Install
npm install

# 3. Generate Prisma
cd frontend && npx prisma generate && cd ..

# 4. Seed Database (optional)
cd frontend && npx prisma db seed && cd ..

# 5. Start
npm run dev:all

# 6. Open browser
# Frontend: http://localhost:3001
# Login: admin@company.com / admin123
```

---

**Last Updated:** October 13, 2026  
**Status:** ✅ Production Ready
