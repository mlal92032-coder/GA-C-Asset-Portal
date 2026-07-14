# Implementation Code Templates & Scripts

**Ready-to-Use Code Examples for 8-Week Roadmap**

---

## ENVIRONMENT SETUP SCRIPTS

### `.env.example` - Complete Environment Variables

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/asset_management"
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=secure_password_here
DB_NAME=asset_management

# Connection Pool
DB_POOL_MIN=10
DB_POOL_MAX=25
DB_POOL_IDLE_TIMEOUT=600000

# PgBouncer
PGBOUNCER_HOST=localhost
PGBOUNCER_PORT=6432

# Redis
REDIS_URL="redis://localhost:6379"
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=

# WebSocket
WEBSOCKET_URL="ws://localhost:3000"
WEBSOCKET_PORT=3001
WEBSOCKET_ENABLE_COMPRESSION=true

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@assetmanagement.com

# AWS S3 (for backups & file storage)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=asset-management-backups

# Auth & Security
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=24h
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# Application
NODE_ENV=development
APP_NAME=Asset Management System
APP_URL=http://localhost:3000
API_URL=http://localhost:3000/api

# Features
ENABLE_WEBSOCKET=true
ENABLE_PWA=true
ENABLE_ANALYTICS=true
ENABLE_INTEGRATIONS=true

# Monitoring
LOG_LEVEL=info
ENABLE_MONITORING=true
SENTRY_DSN=your-sentry-dsn

# Feature Flags
FEATURE_2FA=true
FEATURE_MULTI_TENANCY=true
FEATURE_WORKFLOW=true
```

---

## DATABASE SETUP SCRIPTS

### `scripts/init-db.sh` - Initialize PostgreSQL

```bash
#!/bin/bash
set -e

echo "Initializing PostgreSQL database..."

# Start PostgreSQL
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
sleep 10

# Create database
psql -h localhost -U postgres -c "CREATE DATABASE asset_management;"

# Create extensions
psql -h localhost -U postgres -d asset_management -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
psql -h localhost -U postgres -d asset_management -c "CREATE EXTENSION IF NOT EXISTS \"pg_trgm\";"
psql -h localhost -U postgres -d asset_management -c "CREATE EXTENSION IF NOT EXISTS \"btree_gin\";"

# Run migrations
npx prisma migrate deploy

# Seed database
npx prisma db seed

echo "Database initialization complete!"
```

### `scripts/backup-database.sh` - Database Backup

```bash
#!/bin/bash
set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups"
BACKUP_FILE="$BACKUP_DIR/asset_management_$TIMESTAMP.sql.gz"

mkdir -p $BACKUP_DIR

echo "Creating backup: $BACKUP_FILE"

# Backup database
PGPASSWORD=$DB_PASSWORD pg_dump \
  -h $DB_HOST \
  -U $DB_USER \
  $DB_NAME | gzip > $BACKUP_FILE

# Verify backup
if [ -f "$BACKUP_FILE" ]; then
  SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo "Backup created successfully: $SIZE"
  
  # Upload to S3 if configured
  if [ ! -z "$AWS_S3_BUCKET" ]; then
    echo "Uploading to S3..."
    aws s3 cp $BACKUP_FILE s3://$AWS_S3_BUCKET/backups/ \
      --region $AWS_REGION \
      --sse AES256
    echo "Backup uploaded to S3"
  fi
else
  echo "Backup failed!"
  exit 1
fi
```

### `scripts/restore-database.sh` - Database Restore

```bash
#!/bin/bash
set -e

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: ./restore-database.sh <backup-file>"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "Restoring from backup: $BACKUP_FILE"

# Restore database
PGPASSWORD=$DB_PASSWORD gunzip < $BACKUP_FILE | psql \
  -h $DB_HOST \
  -U $DB_USER \
  $DB_NAME

echo "Database restored successfully!"
```

---

## DOCKER & INFRASTRUCTURE

### `docker-compose.yml` - Complete Stack

```yaml
version: '3.9'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: asset-db
    environment:
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
      POSTGRES_DB: ${DB_NAME:-asset_management}
      POSTGRES_INITDB_ARGS: >-
        -c shared_buffers=256MB
        -c effective_cache_size=1GB
        -c maintenance_work_mem=64MB
        -c checkpoint_completion_target=0.9
        -c wal_buffers=16MB
        -c default_statistics_target=100
        -c max_connections=200
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/01-init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network
    restart: unless-stopped

  # PgBouncer Connection Pool
  pgbouncer:
    image: pgbouncer:latest
    container_name: asset-pgbouncer
    environment:
      PGBOUNCER_DATABASES: |
        asset_management = host=postgres port=5432 user=${DB_USER:-postgres} password=${DB_PASSWORD:-postgres}
      PGBOUNCER_POOL_MODE: transaction
      PGBOUNCER_MAX_CLIENT_CONN: 500
      PGBOUNCER_DEFAULT_POOL_SIZE: 25
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - "6432:6432"
    volumes:
      - ./config/pgbouncer.ini:/etc/pgbouncer/pgbouncer.ini:ro
    networks:
      - app-network
    restart: unless-stopped

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: asset-cache
    command: redis-server --appendonly yes --maxmemory 512mb --maxmemory-policy allkeys-lru
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network
    restart: unless-stopped

  # Next.js Application
  app:
    build: .
    container_name: asset-app
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      REDIS_URL: redis://redis:6379
    ports:
      - "3000:3000"
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - .:/app
      - /app/node_modules
    networks:
      - app-network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

---

## API MIDDLEWARE & UTILITIES

### `lib/middleware/auth.ts` - Authentication Middleware

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function authenticateRequest(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return { error: 'Unauthorized', status: 401 };
    }

    const verified = await jwtVerify(token, secret);
    return { user: verified.payload, status: 200 };
  } catch (error) {
    return { error: 'Invalid token', status: 401 };
  }
}

export function withAuth(handler: Function) {
  return async (request: NextRequest) => {
    const auth = await authenticateRequest(request);
    
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    // Attach user to request
    (request as any).user = auth.user;
    return handler(request);
  };
}
```

### `lib/middleware/rate-limit.ts` - Rate Limiting

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

const redis = new Redis({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m')
});

export async function withRateLimit(request: NextRequest) {
  const identifier = request.headers.get('x-forwarded-for') || 'anonymous';
  
  try {
    const { success, limit, reset, remaining } = await ratelimit.limit(identifier);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { 
          status: 429,
          headers: {
            'RateLimit-Limit': limit.toString(),
            'RateLimit-Remaining': remaining.toString(),
            'RateLimit-Reset': reset.toString()
          }
        }
      );
    }
    
    return null;
  } catch (error) {
    console.error('Rate limit error:', error);
    return null;
  }
}
```

---

## WEBSOCKET IMPLEMENTATION

### `lib/websocket/socket-server.ts` - WebSocket Server Setup

```typescript
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { Logger } from '@/lib/logger';

const logger = new Logger('websocket');

export class WebSocketServer {
  private io: SocketIOServer;
  private connectedUsers = new Map<string, string[]>();

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.APP_URL,
        credentials: true
      },
      transports: ['websocket', 'polling'],
      pingInterval: 25000,
      pingTimeout: 20000
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      logger.info(`User connected: ${socket.id}`);

      socket.on('authenticate', (userId: string) => {
        this.connectedUsers.set(userId, [
          ...(this.connectedUsers.get(userId) || []),
          socket.id
        ]);
        socket.join(`user:${userId}`);
        logger.info(`User authenticated: ${userId}`);
      });

      socket.on('disconnect', () => {
        logger.info(`User disconnected: ${socket.id}`);
      });

      socket.on('error', (error) => {
        logger.error(`Socket error: ${error}`);
      });
    });
  }

  public emit(event: string, data: any) {
    this.io.emit(event, data);
  }

  public emitToUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  public emitToRoom(room: string, event: string, data: any) {
    this.io.to(room).emit(event, data);
  }

  public getConnectedUsers() {
    return Array.from(this.connectedUsers.keys());
  }
}

let socketServer: WebSocketServer;

export function getSocketServer(httpServer?: HTTPServer): WebSocketServer {
  if (!socketServer && httpServer) {
    socketServer = new WebSocketServer(httpServer);
  }
  return socketServer;
}
```

### `lib/websocket/events.ts` - Event Handlers

```typescript
import { getSocketServer } from './socket-server';
import prisma from '@/lib/db';

export async function broadcastAssetUpdate(assetId: string, asset: any) {
  const socketServer = getSocketServer();
  socketServer.emit('asset:updated', {
    assetId,
    asset,
    timestamp: new Date().toISOString()
  });

  // Also broadcast to specific dashboard
  socketServer.emit('dashboard:stats:updated', {
    timestamp: new Date().toISOString()
  });
}

export async function broadcastWorkflowUpdate(workflowId: string, status: string) {
  const socketServer = getSocketServer();
  socketServer.emit('workflow:updated', {
    workflowId,
    status,
    timestamp: new Date().toISOString()
  });
}

export async function notifyUser(userId: string, notification: any) {
  const socketServer = getSocketServer();
  socketServer.emitToUser(userId, 'notification:new', notification);

  // Also save to database
  await prisma.notification.create({
    data: {
      userId,
      title: notification.title,
      message: notification.message,
      type: notification.type || 'INFO',
      link: notification.link
    }
  });
}
```

---

## SERVICE LAYER EXAMPLES

### `lib/services/analytics-service.ts` - Analytics

```typescript
import prisma from '@/lib/db';
import { redisClient } from '@/lib/cache/redis-client';
import { Logger } from '@/lib/logger';

const logger = new Logger('analytics');

export class AnalyticsService {
  private CACHE_KEY = 'analytics:dashboard';
  private CACHE_TTL = 300; // 5 minutes

  async getDashboardStats() {
    try {
      // Try cache first
      const cached = await redisClient.getJSON(this.CACHE_KEY);
      if (cached) {
        return cached;
      }

      // Calculate fresh stats
      const stats = await this.calculateStats();

      // Cache results
      await redisClient.setJSON(this.CACHE_KEY, stats, this.CACHE_TTL);

      return stats;
    } catch (error) {
      logger.error('Error getting dashboard stats:', error);
      throw error;
    }
  }

  private async calculateStats() {
    const [
      totalAssets,
      byCondition,
      byStatus,
      byType,
      totalValue,
      maintenanceCost,
      assetsTurnover
    ] = await Promise.all([
      prisma.furnitureAsset.count(),
      this.getByCondition(),
      this.getByStatus(),
      this.getByType(),
      this.getTotalValue(),
      this.getMaintenanceCost(),
      this.getAssetsTurnover()
    ]);

    return {
      totalAssets,
      byCondition,
      byStatus,
      byType,
      totalValue,
      maintenanceCost,
      assetsTurnover,
      calculatedAt: new Date().toISOString()
    };
  }

  private async getByCondition() {
    const conditions = await prisma.furnitureAsset.groupBy({
      by: ['condition'],
      _count: true
    });

    return Object.fromEntries(
      conditions.map(c => [c.condition, c._count])
    );
  }

  private async getByStatus() {
    const statuses = await prisma.furnitureAsset.groupBy({
      by: ['status'],
      _count: true
    });

    return Object.fromEntries(
      statuses.map(s => [s.status, s._count])
    );
  }

  private async getByType() {
    const [furniture, electronic, vehicles] = await Promise.all([
      prisma.furnitureAsset.count(),
      prisma.electronicAsset.count(),
      prisma.vehicleAsset.count()
    ]);

    return { FURNITURE: furniture, ELECTRONIC: electronic, VEHICLE: vehicles };
  }

  private async getTotalValue() {
    const [furniture, electronic, vehicles] = await Promise.all([
      prisma.furnitureAsset.aggregate({
        _sum: { purchasePrice: true }
      }),
      prisma.electronicAsset.aggregate({
        _sum: { purchasePrice: true }
      }),
      prisma.vehicleAsset.aggregate({
        _sum: { purchasePrice: true }
      })
    ]);

    return (
      (furniture._sum.purchasePrice || 0) +
      (electronic._sum.purchasePrice || 0) +
      (vehicles._sum.purchasePrice || 0)
    );
  }

  private async getMaintenanceCost() {
    const result = await prisma.maintenance.aggregate({
      _sum: { cost: true }
    });
    return result._sum.cost || 0;
  }

  private async getAssetsTurnover() {
    const disposed = await prisma.furnitureAsset.count({
      where: { status: 'DISPOSED' }
    });
    return disposed;
  }
}

export const analyticsService = new AnalyticsService();
```

### `lib/services/workflow-engine.ts` - Workflow Engine

```typescript
import prisma from '@/lib/db';
import { Logger } from '@/lib/logger';
import { broadcastWorkflowUpdate } from '@/lib/websocket/events';

const logger = new Logger('workflow');

export class WorkflowEngine {
  async executeWorkflow(workflowId: string, entityId: string, entityType: string) {
    try {
      logger.info(`Executing workflow: ${workflowId}`);

      const workflow = await prisma.workflowDefinition.findUnique({
        where: { id: workflowId },
        include: { steps: { orderBy: { stepOrder: 'asc' } } }
      });

      if (!workflow) {
        throw new Error(`Workflow not found: ${workflowId}`);
      }

      // Create workflow instance
      const instance = await prisma.workflowInstance.create({
        data: {
          workflowId,
          entityId,
          entityType,
          initiatedBy: '', // Set from context
          status: 'IN_PROGRESS',
          currentStep: 1
        }
      });

      // Execute first step
      await this.executeStep(instance.id, workflow.steps[0]);

      // Broadcast update
      await broadcastWorkflowUpdate(workflowId, 'IN_PROGRESS');

      return instance;
    } catch (error) {
      logger.error('Workflow execution error:', error);
      throw error;
    }
  }

  private async executeStep(instanceId: string, step: any) {
    try {
      logger.info(`Executing step: ${step.id}`);

      // Execute step action based on type
      switch (step.stepType) {
        case 'APPROVAL':
          await this.executeApprovalStep(instanceId, step);
          break;
        case 'NOTIFICATION':
          await this.executeNotificationStep(instanceId, step);
          break;
        case 'SYSTEM_ACTION':
          await this.executeSystemAction(instanceId, step);
          break;
      }

      // Log step execution
      await prisma.workflowLog.create({
        data: {
          instanceId,
          stepName: step.stepName,
          action: 'STARTED',
          actionBy: '', // Set from context
          timestamp: new Date()
        }
      });
    } catch (error) {
      logger.error('Step execution error:', error);
      throw error;
    }
  }

  private async executeApprovalStep(instanceId: string, step: any) {
    // Create approval rule
    const approvers = JSON.parse(step.approvers || '[]');
    
    for (const approverId of approvers) {
      // Notify approver
      // Create approval log entry
    }
  }

  private async executeNotificationStep(instanceId: string, step: any) {
    // Send notifications to relevant users
  }

  private async executeSystemAction(instanceId: string, step: any) {
    // Execute configured system action
    const config = JSON.parse(step.actionConfig || '{}');
    // Implementation based on config
  }
}

export const workflowEngine = new WorkflowEngine();
```

---

## REACT COMPONENT EXAMPLES

### `src/components/RealTimeDashboard.tsx` - Real-Time Dashboard

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/lib/hooks/useSocket';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export function RealTimeDashboard() {
  const { socket } = useSocket();
  const [stats, setStats] = useState({
    totalAssets: 0,
    byCondition: {},
    byStatus: {},
    assetsTurnover: 0
  });
  const [metrics, setMetrics] = useState<any[]>([]);

  useEffect(() => {
    if (!socket) return;

    // Listen for real-time updates
    socket.on('dashboard:stats:updated', (data) => {
      setStats(prev => ({ ...prev, ...data }));
    });

    socket.on('metrics:update', (metric) => {
      setMetrics(prev => [...prev.slice(-99), metric]);
    });

    return () => {
      socket.off('dashboard:stats:updated');
      socket.off('metrics:update');
    };
  }, [socket]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-600">Total Assets</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalAssets}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-600">Assets Turnover</h3>
          <p className="text-3xl font-bold mt-2">{stats.assetsTurnover}</p>
        </Card>

        {/* More stat cards */}
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Live Metrics</h2>
        <LineChart width={800} height={300} data={metrics}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#2563eb" />
        </LineChart>
      </Card>
    </div>
  );
}
```

### `src/components/Scanner/QRScanner.tsx` - QR Scanner

```typescript
'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';
import { Button } from '@/components/ui/button';

export function QRScanner({ onScan }: { onScan: (result: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(false);
  const readerRef = useRef(new BrowserQRCodeReader());

  useEffect(() => {
    if (!scanning || !videoRef.current) return;

    const startScanning = async () => {
      try {
        const result = await readerRef.current.decodeOnceFromVideoElement(videoRef.current!);
        if (result) {
          onScan(result.getText());
          // Continue scanning
          scanNext();
        }
      } catch (error) {
        console.error('Scan error:', error);
        scanNext();
      }
    };

    const scanNext = () => {
      setTimeout(startScanning, 500);
    };

    startScanning();
  }, [scanning, onScan]);

  const startCamera = async () => {
    try {
      const devices = await BrowserQRCodeReader.listVideoInputDevices();
      if (devices.length === 0) {
        throw new Error('No camera device found');
      }

      await readerRef.current.decodeFromVideoDevice(
        devices[0].deviceId,
        videoRef.current!,
        (result) => {
          if (result) {
            onScan(result.getText());
          }
        }
      );

      setScanning(true);
    } catch (error) {
      console.error('Camera access error:', error);
    }
  };

  const stopCamera = async () => {
    setScanning(false);
    try {
      await readerRef.current.reset();
    } catch (error) {
      console.error('Stop camera error:', error);
    }
  };

  return (
    <div className="space-y-4">
      <video
        ref={videoRef}
        className="w-full border-2 border-blue-500 rounded-lg"
        style={{ display: scanning ? 'block' : 'none' }}
      />

      <div className="flex gap-4">
        <Button
          onClick={startCamera}
          disabled={scanning}
          variant="primary"
        >
          Start Camera
        </Button>
        <Button
          onClick={stopCamera}
          disabled={!scanning}
          variant="secondary"
        >
          Stop Camera
        </Button>
      </div>
    </div>
  );
}
```

---

## TESTING EXAMPLES

### `__tests__/analytics.test.ts` - Analytics Tests

```typescript
import { analyticsService } from '@/lib/services/analytics-service';
import prisma from '@/lib/db';

describe('Analytics Service', () => {
  beforeEach(async () => {
    // Setup test data
  });

  afterEach(async () => {
    // Cleanup
  });

  it('should calculate dashboard stats', async () => {
    const stats = await analyticsService.getDashboardStats();
    
    expect(stats).toHaveProperty('totalAssets');
    expect(stats).toHaveProperty('byCondition');
    expect(stats).toHaveProperty('byStatus');
    expect(typeof stats.totalAssets).toBe('number');
  });

  it('should cache results', async () => {
    const stats1 = await analyticsService.getDashboardStats();
    const stats2 = await analyticsService.getDashboardStats();
    
    expect(stats1).toEqual(stats2);
  });

  it('should include all required metrics', async () => {
    const stats = await analyticsService.getDashboardStats();
    
    expect(stats).toMatchObject({
      totalAssets: expect.any(Number),
      byCondition: expect.any(Object),
      byStatus: expect.any(Object),
      byType: expect.any(Object),
      totalValue: expect.any(Number),
      maintenanceCost: expect.any(Number),
      assetsTurnover: expect.any(Number)
    });
  });
});
```

---

## DEPLOYMENT SCRIPTS

### `deploy.sh` - Deploy to Production

```bash
#!/bin/bash
set -e

echo "🚀 Starting deployment to production..."

# Variables
ENVIRONMENT=${1:-production}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# 1. Backup production database
echo "📦 Backing up production database..."
./scripts/backup-database.sh

# 2. Build application
echo "🔨 Building application..."
npm run build

# 3. Run tests
echo "✅ Running tests..."
npm run test

# 4. Run migrations
echo "🔄 Running migrations..."
npx prisma migrate deploy

# 5. Deploy to server
echo "🌍 Deploying to server..."
# Replace with your deployment command
# docker build -t asset-management:$TIMESTAMP .
# docker push your-registry/asset-management:$TIMESTAMP

# 6. Verify deployment
echo "🔍 Verifying deployment..."
npm run health-check

# 7. Notify team
echo "✅ Deployment complete!"
echo "Deployed version: $TIMESTAMP"

# Optional: Send Slack notification
# curl -X POST -H 'Content-type: application/json' \
#   --data "{\"text\":\"Production deployment complete: $TIMESTAMP\"}" \
#   $SLACK_WEBHOOK_URL
```

---

## MONITORING & HEALTH CHECKS

### `lib/health-check.ts` - Health Check

```typescript
import prisma from '@/lib/db';
import { redisClient } from '@/lib/cache/redis-client';
import { Logger } from '@/lib/logger';

const logger = new Logger('health-check');

export async function performHealthCheck() {
  const checks = {
    database: false,
    redis: false,
    api: true,
    timestamp: new Date().toISOString()
  };

  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
    logger.info('Database check passed');
  } catch (error) {
    logger.error('Database check failed:', error);
  }

  try {
    // Check Redis
    const ping = await redisClient.ping();
    checks.redis = ping;
    logger.info('Redis check passed');
  } catch (error) {
    logger.error('Redis check failed:', error);
  }

  const allHealthy = Object.values(checks).every(v => v === true || v instanceof Date);
  
  if (!allHealthy) {
    logger.warn('Health check failed', checks);
  }

  return checks;
}
```

---

**Version**: 1.0  
**Last Updated**: 2026-07-13  
**Status**: Ready for Use

These templates provide the foundation for implementing the 8-week roadmap. Customize as needed for your specific requirements.
