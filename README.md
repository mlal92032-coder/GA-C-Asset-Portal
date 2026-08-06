# Enterprise Employee Asset Management System

A complete, production-ready asset management system built with Next.js, PostgreSQL, and modern web technologies.

## Features

### Core Capabilities
- **Multi-tenancy**: Complete tenant isolation with organization-based access control
- **Asset Lifecycle**: Full asset management from acquisition to retirement
- **Employee Management**: HR integration with department and location tracking
- **Checkout/Checkin**: Sophisticated workflow for asset borrowing and returns
- **Maintenance Scheduling**: Automated maintenance tracking and notifications
- **Financial Tracking**: Depreciation calculation, budgeting, and cost analysis
- **Analytics & Reporting**: Real-time dashboards and comprehensive reporting
- **Workflow Automation**: Customizable approval workflows
- **Integrations**: Third-party system connectors (Slack, Teams, JIRA, etc.)
- **Audit & Compliance**: Complete audit logging and compliance tracking

### Technical Features
- **Real-time Updates**: WebSocket-based live notifications
- **Job Queue**: Background job processing with BullMQ
- **Multi-Factor Authentication**: 2FA/MFA support with TOTP
- **Role-Based Access Control**: Fine-grained permission management
- **API Security**: JWT tokens, rate limiting, CORS protection
- **Database**: 40+ normalized tables with optimized indexes
- **Performance**: Caching, pagination, and query optimization
- **Mobile Ready**: PWA support with offline capabilities
- **Responsive Design**: Mobile-first UI with Tailwind CSS

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Next.js 14 (with API routes)
- **Database**: PostgreSQL 15+
- **ORM**: Prisma
- **Caching**: Redis
- **Job Queue**: BullMQ
- **WebSocket**: Socket.io
- **Authentication**: JWT + 2FA/TOTP
- **API Validation**: Zod
- **Documentation**: OpenAPI/Swagger

### Frontend
- **Framework**: React 18
- **Build Tool**: Next.js
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Charts**: Recharts
- **Tables**: React Table (TanStack)

### DevOps
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Kubernetes
- **Infrastructure**: Terraform
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus & Grafana
- **Logging**: Winston

## Project Structure

```
asset-management/
├── prisma/                    # Database schema
│   ├── schema.prisma         # 40+ tables
│   └── migrations/           # Database migrations
├── src/
│   ├── app/                  # Next.js app directory
│   ├── api/                  # API routes (60+ endpoints)
│   ├── components/           # React components (100+)
│   ├── pages/                # Pages and layouts
│   ├── hooks/                # Custom React hooks
│   ├── services/             # Business logic services
│   ├── middleware/           # Request middleware
│   ├── utils/                # Utility functions
│   ├── types/                # TypeScript types
│   └── websocket/            # WebSocket handlers
├── docker/                   # Docker configuration
├── kubernetes/               # K8s manifests
├── terraform/                # Infrastructure as Code
├── tests/                    # Test suites
└── .github/
    └── workflows/            # CI/CD pipelines
```

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional)

### Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd asset-management
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Setup database:
```bash
npm run db:migrate
npm run db:seed
```

5. Start development server:
```bash
npm run dev
```

Access the application at `http://localhost:3000`

6. In a separate terminal, start WebSocket server:
```bash
npm run ws
```

7. In another terminal, start job queue processor:
```bash
npm run jobs
```

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Kubernetes Deployment

```bash
# Deploy to Kubernetes
kubectl apply -f kubernetes/

# Check deployment status
kubectl get pods
kubectl get svc

# Access the application
kubectl port-forward svc/asset-management-service 3000:80
```

### Terraform Deployment

```bash
cd terraform

# Initialize Terraform
terraform init

# Review changes
terraform plan

# Deploy infrastructure
terraform apply
```

## API Documentation

### Authentication Endpoints

**Login**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Enable 2FA**
```
POST /api/auth/2fa/enable
Authorization: Bearer <token>
```

**Verify 2FA**
```
POST /api/auth/2fa/verify
{
  "code": "123456"
}
```

### Employee Management

**List Employees**
```
GET /api/employees?page=1&limit=20&search=john&departmentId=dept-123
Authorization: Bearer <token>
X-Organization-Id: org-123
```

**Create Employee**
```
POST /api/employees
Authorization: Bearer <token>
X-Organization-Id: org-123

{
  "employeeId": "EMP001",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "departmentId": "dept-123"
}
```

### Asset Management

**Create Asset**
```
POST /api/assets/create
Authorization: Bearer <token>
X-Organization-Id: org-123

{
  "assetTag": "ASSET-001",
  "name": "Dell Laptop",
  "categoryId": "cat-123",
  "serialNumber": "SN123456",
  "purchasePrice": 1500,
  "purchaseDate": "2024-01-01T00:00:00Z"
}
```

**Assign Asset to Employee**
```
PUT /api/assets/ASSET-ID/assign
Authorization: Bearer <token>
X-Organization-Id: org-123

{
  "employeeId": "emp-123",
  "reason": "Work assignment"
}
```

### Checkout/Checkin Workflow

**Request Checkout**
```
POST /api/checkout
Authorization: Bearer <token>
X-Organization-Id: org-123

{
  "assetId": "asset-123",
  "employeeId": "emp-123",
  "reason": "Business travel"
}
```

**Approve Checkout**
```
PUT /api/checkout/REQUEST-ID/approve
Authorization: Bearer <token>
X-Organization-Id: org-123

{
  "notes": "Approved by manager"
}
```

**Check In Asset**
```
PUT /api/checkout/REQUEST-ID/checkin
Authorization: Bearer <token>
X-Organization-Id: org-123

{
  "condition": "good",
  "notes": "Asset returned in good condition"
}
```

### Analytics & Reporting

**Get Dashboard Analytics**
```
GET /api/reports/analytics?type=summary&period=30d
Authorization: Bearer <token>
X-Organization-Id: org-123
```

**Generate Report**
```
POST /api/reports/generate
Authorization: Bearer <token>
X-Organization-Id: org-123

{
  "name": "Q4 Asset Summary",
  "type": "asset_summary",
  "format": "pdf",
  "filters": {
    "dateRange": ["2024-10-01", "2024-12-31"],
    "categories": ["cat-123", "cat-456"]
  }
}
```

## Database Schema Overview

### Core Tables (40+)

**Organization & Multi-tenancy**
- Organization
- OrganizationSettings

**Authentication & Authorization**
- User
- Session
- Permission

**HR & Employees**
- Employee
- Department
- Location

**Asset Management**
- Asset
- AssetCategory
- AssetAssignment
- AssetLocation
- AssetAttachment

**Workflows**
- CheckoutRequest
- MaintenancePlan
- MaintenanceRecord
- Workflow
- WorkflowStep
- WorkflowInstance

**Financial**
- DepreciationRecord
- Budget

**Notifications & Integration**
- Notification
- Integration
- IntegrationEvent
- IntegrationAccess
- Webhook
- APIKey

**Auditing & Compliance**
- AuditLog
- ActivityLog
- CustomField
- CustomFieldValue

**Reporting**
- Report
- ReportSubscription

## Authentication & Security

### Authentication Flow

1. User submits email and password
2. Password verified against bcrypt hash
3. Account lockout after 5 failed attempts
4. JWT access token generated (15 min expiration)
5. Refresh token generated (7 day expiration)
6. Session created in database
7. Refresh token stored in httpOnly cookie

### Multi-Factor Authentication

1. User enables 2FA
2. TOTP secret generated and stored
3. QR code displayed for authenticator app
4. User scans QR code
5. User enters TOTP code
6. Backup codes generated

### Authorization

- **RBAC**: Admin, Manager, User, Auditor roles
- **Resource-based**: Fine-grained permissions (create, read, update, delete, approve)
- **Tenant-based**: Complete organization isolation
- **Time-based**: Session expiration and refresh token rotation

### Security Headers

- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000
- Content-Security-Policy: default-src 'self'

### Data Protection

- Password hashing with bcrypt (12 rounds)
- Sensitive data encryption with AES-256
- SQL injection prevention (Prisma ORM)
- XSS protection (React escaping)
- CSRF tokens for state-changing operations
- Rate limiting on API endpoints

## Real-time Features

### WebSocket Events

**Asset Updates**
```javascript
socket.on('asset:updated', (asset) => {
  // Update UI with new asset data
});

socket.emit('asset:status-changed', {
  assetId: 'asset-123',
  status: 'maintenance'
});
```

**Notifications**
```javascript
socket.on('notification:new', (notification) => {
  // Show new notification
});

socket.emit('notification:read', notificationId);
```

**Dashboard Updates**
```javascript
socket.on('dashboard:updated', (metrics) => {
  // Update dashboard metrics
});
```

## Background Jobs

### Job Types

1. **Notification Delivery**
   - Send emails
   - Push notifications
   - SMS alerts

2. **Report Generation**
   - Asset summary reports
   - Depreciation schedules
   - Maintenance reports
   - Financial analysis

3. **Maintenance Scheduling**
   - Send maintenance reminders
   - Update maintenance status
   - Generate maintenance schedules

4. **Depreciation Calculation**
   - Monthly depreciation calculations
   - Book value updates
   - Financial reporting

### Job Configuration

```typescript
// Cron schedule examples
- Daily: 0 8 * * * (8 AM daily)
- Weekly: 0 9 * * 1 (9 AM Monday)
- Monthly: 0 0 1 * * (12 AM 1st of month)
```

## Testing

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

### Coverage Report
```bash
npm run test -- --coverage
```

## Performance Optimization

### Database
- Connection pooling with Prisma
- Query optimization with indexes
- Pagination for large datasets
- Aggregation queries for analytics

### Caching
- Redis caching for frequently accessed data
- HTTP caching headers
- Browser caching strategies
- Stale-while-revalidate patterns

### Frontend
- Code splitting with Next.js
- Image optimization
- CSS minification
- JavaScript compression
- Lazy loading of components

### Backend
- Database query optimization
- Gzip compression
- CDN for static assets
- Connection pooling

## Monitoring & Logging

### Logging Levels
- DEBUG: Detailed diagnostic information
- INFO: General informational messages
- WARN: Warning messages
- ERROR: Error messages

### Key Metrics
- API response times
- Database query performance
- Job queue length
- WebSocket connections
- Error rates
- Authentication attempts

### Alerts
- High error rate (>5%)
- Slow queries (>1s)
- Job queue backed up
- Database connection pool exhausted
- Memory usage critical

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Redis instance running
- [ ] SSL/TLS certificates configured
- [ ] Email service configured
- [ ] Backup strategy implemented
- [ ] Monitoring configured
- [ ] Error tracking (Sentry) configured
- [ ] CDN configured
- [ ] Load balancer configured
- [ ] Auto-scaling policies set
- [ ] Security audit completed
- [ ] Performance testing completed
- [ ] Disaster recovery plan created

## Troubleshooting

### Database Connection Issues
```bash
# Check database connectivity
psql -h localhost -U app_user -d asset_management

# Run migrations
npm run db:migrate

# Check Prisma studio
npm run db:studio
```

### Redis Connection Issues
```bash
# Check Redis connectivity
redis-cli ping

# Monitor Redis
redis-cli monitor
```

### WebSocket Issues
```bash
# Check WebSocket port
netstat -an | grep 3001

# Enable debug logging
DEBUG=socket.io:* npm run ws
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add/update tests
5. Submit a pull request

## License

MIT

## Support

For issues and questions:
- Create an issue on GitHub
- Contact: support@assetmanagement.com
- Documentation: https://docs.assetmanagement.com

## Changelog

### v1.0.0 - Initial Release
- Complete asset management system
- Multi-tenancy support
- Real-time dashboard
- Comprehensive reporting
- API with 60+ endpoints
- Full test coverage
"# gac-admin" 
