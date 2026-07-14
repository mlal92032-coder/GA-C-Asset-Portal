# PRODUCTION DEPLOYMENT GUIDE

## Pre-Deployment Checklist

### Environment & Infrastructure
- [ ] PostgreSQL 15+ database created
- [ ] Redis 7+ instance running
- [ ] Domain name configured
- [ ] SSL/TLS certificates obtained
- [ ] Storage bucket (S3/similar) configured
- [ ] Email service configured (SMTP)
- [ ] CDN configured (CloudFront/similar)

### Application Configuration
- [ ] Copy .env.example to .env.production
- [ ] Set all environment variables
- [ ] Generate secure JWT secrets (32+ chars)
- [ ] Set database connection pool size
- [ ] Configure Redis connection
- [ ] Set up error tracking (Sentry)
- [ ] Configure logging service

### Security Hardening
- [ ] Change default credentials
- [ ] Enable 2FA for admin accounts
- [ ] Configure rate limiting
- [ ] Setup WAF rules
- [ ] Enable CORS for specific origins only
- [ ] Configure CSRF protection
- [ ] Setup DDoS protection
- [ ] Enable database backups
- [ ] Test disaster recovery

### Testing & Validation
- [ ] Run full test suite
- [ ] Perform security audit
- [ ] Load test the system
- [ ] Test backup/restore procedures
- [ ] Verify SSL certificate
- [ ] Test all integrations

## Deployment Steps

### 1. Using Docker Compose (Simplified Production)

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker exec asset-app npm run db:migrate

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f app
```

### 2. Using Kubernetes (Recommended for Scale)

```bash
# Create namespace
kubectl create namespace asset-management

# Create secrets
kubectl create secret generic db-credentials \
  --from-literal=DATABASE_URL='postgresql://user:pass@host:5432/db' \
  -n asset-management

kubectl create secret generic app-secrets \
  --from-literal=JWT_SECRET='your-secret-here' \
  --from-literal=ENCRYPTION_KEY='your-key-here' \
  -n asset-management

# Deploy application
kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/configmap.yaml
kubectl apply -f kubernetes/secrets.yaml
kubectl apply -f kubernetes/deployment.yaml
kubectl apply -f kubernetes/service.yaml
kubectl apply -f kubernetes/ingress.yaml
kubectl apply -f kubernetes/hpa.yaml

# Verify deployment
kubectl get pods -n asset-management
kubectl get svc -n asset-management
kubectl logs -f deployment/asset-management-app -n asset-management

# Setup auto-scaling
kubectl autoscale deployment asset-management-app \
  --min=3 --max=10 \
  -n asset-management
```

### 3. Using AWS with Terraform

```bash
cd terraform

# Initialize
terraform init

# Plan deployment
terraform plan -var-file=production.tfvars

# Apply configuration
terraform apply -var-file=production.tfvars

# Get outputs
terraform output -json
```

### 4. Database Setup

```bash
# Connect to database
psql -h your-db-host -U postgres

# Create user
CREATE USER app_user WITH PASSWORD 'secure_password';
CREATE DATABASE asset_management OWNER app_user;

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE asset_management TO app_user;

# Run migrations
npm run db:migrate

# Seed data (optional)
npm run db:seed
```

### 5. Post-Deployment

```bash
# Run health checks
curl https://your-domain.com/health

# Verify API
curl -X GET https://your-domain.com/api/organizations \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check WebSocket
wscat -c wss://your-domain.com/socket.io

# Monitor logs
docker logs -f container-name
# or
kubectl logs -f deployment/asset-management-app -n asset-management

# Run smoke tests
npm run test:smoke
```

## Performance Tuning

### Database Optimization
```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM assets WHERE status = 'available';

-- Create indexes for common queries
CREATE INDEX idx_asset_status ON assets(status);
CREATE INDEX idx_asset_organization ON assets(organizationId);
CREATE INDEX idx_assignment_employee ON asset_assignments(employeeId);

-- Vacuum and analyze
VACUUM ANALYZE;
```

### Redis Caching
```bash
# Monitor Redis
redis-cli
> INFO stats
> MONITOR

# Configure persistence
# In redis.conf:
save 900 1
save 300 10
save 60 10000
appendonly yes
```

### Load Balancer Configuration
```nginx
upstream backend {
    server app1:3000;
    server app2:3000;
    server app3:3000;
}

server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    gzip on;
    gzip_types application/json text/plain text/css application/javascript;
    
    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

## Monitoring & Alerts

### Key Metrics to Monitor
- API response time (target: <200ms)
- Database query time (target: <100ms)
- Error rate (target: <1%)
- CPU usage (target: <70%)
- Memory usage (target: <80%)
- Disk space (alert: <10%)
- Connection pool usage
- WebSocket connection count

### Alert Thresholds
```yaml
alerts:
  - high_error_rate: > 5%
  - slow_response: > 1s
  - database_slow_query: > 500ms
  - high_cpu: > 85%
  - high_memory: > 90%
  - disk_full: < 5%
  - db_connection_pool_exhausted: true
```

### Setup Monitoring
```bash
# Prometheus (metrics collection)
docker run -d -p 9090:9090 \
  -v /path/to/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus

# Grafana (dashboards)
docker run -d -p 3000:3000 \
  -e GF_SECURITY_ADMIN_PASSWORD=admin \
  grafana/grafana

# Alert Manager
docker run -d -p 9093:9093 \
  -v /path/to/alertmanager.yml:/etc/alertmanager/config.yml \
  prom/alertmanager
```

## Backup & Disaster Recovery

### Database Backup Strategy
```bash
# Daily backup
0 2 * * * pg_dump postgresql://user:pass@host/db | gzip > /backups/db-$(date +\%Y\%m\%d).sql.gz

# Weekly full backup to S3
0 3 * * 0 pg_dump postgresql://user:pass@host/db | aws s3 cp - s3://backups/db-weekly-$(date +\%Y\%m\%d).sql.gz

# Point-in-time recovery setup
# Enable WAL archiving in postgresql.conf
archive_mode = on
archive_command = 'aws s3 cp %p s3://wal-backups/%f'
```

### Restore from Backup
```bash
# Download backup
aws s3 cp s3://backups/db-backup.sql.gz ./

# Restore
gunzip -c db-backup.sql.gz | psql postgresql://user:pass@host/db
```

### Data Export
```bash
# Export all data
npm run db:export

# Import data
npm run db:import
```

## Scaling Strategies

### Horizontal Scaling
1. Add more application instances
2. Configure load balancer
3. Enable sticky sessions (if needed)
4. Scale database read replicas

### Vertical Scaling
1. Increase CPU/Memory allocation
2. Upgrade to larger instance types
3. Increase database connection pool

### Caching Strategy
- Cache API responses in Redis (5-10 min TTL)
- Cache static assets in CDN (1 hour TTL)
- Cache database queries (varies by data)
- Cache authentication tokens

## Rollback Procedures

### Blue-Green Deployment
```bash
# Deploy to green environment
kubectl set image deployment/asset-management-green \
  app=asset-management:new-version

# Verify green environment
kubectl logs -f deployment/asset-management-green

# Switch traffic to green
kubectl patch service asset-management \
  -p '{"spec":{"selector":{"version":"green"}}}'

# Rollback to blue if needed
kubectl patch service asset-management \
  -p '{"spec":{"selector":{"version":"blue"}}}'
```

### Database Rollback
```bash
# List migrations
prisma migrate status

# Rollback to specific migration
prisma migrate resolve --rolled-back migration-name

# Revert to previous data
psql -f /backups/restore-point.sql
```

## Maintenance Windows

### Scheduled Maintenance
- **Frequency**: Monthly, typically 2-4 AM UTC
- **Duration**: 1 hour
- **Activities**: Database cleanup, index optimization, OS patches

### Zero-Downtime Deployment
1. Deploy to new instance
2. Run migrations on new instance
3. Warm up cache
4. Switch traffic gradually
5. Monitor for errors
6. Keep old instance for 30 minutes

## Security Post-Deployment

```bash
# Run security scan
npm run security:check

# Check for vulnerabilities
npm audit

# Verify SSL
openssl s_client -connect your-domain.com:443

# Test security headers
curl -I https://your-domain.com | grep -i "content-security\|x-frame\|x-xss"

# Test authentication
curl -X GET https://your-domain.com/api/protected \
  -H "Authorization: Bearer invalid" # should return 401
```

## Troubleshooting

### Common Issues

**Database Connection Errors**
```bash
# Check connectivity
psql -h your-db-host -U app_user -d asset_management -c "SELECT 1"

# Check connection pool
psql -c "SELECT count(*) FROM pg_stat_activity;"
```

**Redis Connection Errors**
```bash
# Check Redis connectivity
redis-cli -h your-redis-host ping

# Check memory usage
redis-cli info memory
```

**WebSocket Issues**
```bash
# Check WebSocket port
netstat -an | grep 3001

# Test WebSocket connection
wscat -c ws://localhost:3001
```

**Memory Leaks**
```bash
# Monitor Node.js memory
node --inspect app.js

# Use Chrome DevTools
chrome://inspect

# Check for open connections
lsof -p <pid>
```

## Performance Metrics Dashboard

Access monitoring dashboard:
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000
- CloudWatch: https://console.aws.amazon.com/cloudwatch

## Support & Documentation

- **API Docs**: /api/docs
- **Health Check**: /health
- **Status Page**: https://status.your-domain.com
- **Contact**: support@your-domain.com

## Deployment Success Criteria

- [ ] All health checks passing
- [ ] API response time < 200ms
- [ ] Error rate < 1%
- [ ] Database connectivity verified
- [ ] WebSocket connections active
- [ ] Real-time updates working
- [ ] Backups running successfully
- [ ] Monitoring alerts configured
- [ ] Team trained on operations
- [ ] Runbooks documented

Deployment is complete when all criteria are met!
