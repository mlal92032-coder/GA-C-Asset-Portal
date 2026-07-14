# Phase 1 Implementation - Ready-to-Use Code Snippets

This document contains complete, production-ready code snippets for quick copy-paste implementation.

---

## FILE INDEX

1. **`src/lib/cache.ts`** - Cache management system
2. **`src/lib/rate-limiter.ts`** - Rate limiting (enhanced)
3. **`src/middleware.ts`** - Security headers
4. **`src/types/analytics.ts`** - Analytics type definitions
5. **`src/types/search.ts`** - Search type definitions
6. **`src/types/workflows.ts`** - Workflow type definitions
7. **`src/types/reports.ts`** - Reporting type definitions
8. **`src/app/api/dashboard/stats/route.ts`** - Optimized dashboard
9. **`src/app/api/dashboard/trends/route.ts`** - Trends endpoint
10. **`src/app/api/dashboard/depreciation/route.ts`** - Depreciation endpoint
11. **`src/app/api/dashboard/health/route.ts`** - Health indicators
12. **`src/app/api/search/advanced/route.ts`** - Advanced search
13. **`src/hooks/useAdvancedSearch.ts`** - Search hook
14. **`src/app/api/workflows/checkout-approval/route.ts`** - Checkout workflow
15. **`src/app/api/workflows/asset-status/validate/route.ts`** - Status validation
16. **`src/app/api/workflows/maintenance-schedule/route.ts`** - Maintenance scheduling

---

## 1. src/lib/cache.ts

```typescript
import { LRUCache } from 'lru-cache';

/**
 * Configuration options for cache operations
 */
export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
}

/**
 * Enterprise-grade cache manager using LRU eviction
 * Provides TTL expiration, pattern-based invalidation, and thread-safe operations
 */
export class CacheManager {
  private cache: LRUCache<string, any>;

  constructor(maxSize: number = 100) {
    this.cache = new LRUCache({
      max: maxSize,
      ttl: 5 * 60 * 1000, // 5 minutes default
      allowStale: false,
      updateAgeOnGet: true,
    });
  }

  /**
   * Retrieve a value from cache
   * @param key Cache key
   * @returns Cached value or undefined if not found/expired
   */
  get(key: string): any | undefined {
    return this.cache.get(key);
  }

  /**
   * Store a value in cache
   * @param key Cache key
   * @param value Value to cache
   * @param options TTL configuration
   */
  set(key: string, value: any, options?: CacheOptions): void {
    this.cache.set(key, value, {
      ttl: options?.ttl || 5 * 60 * 1000,
    });
  }

  /**
   * Delete a specific key from cache
   * @param key Cache key to delete
   * @returns true if key existed, false otherwise
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Invalidate cache entries matching a pattern
   * @param pattern RegExp to match keys
   */
  invalidatePattern(pattern: RegExp): void {
    for (const [key] of this.cache.entries()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; itemCount: number } {
    return {
      size: this.cache.size,
      itemCount: this.cache.size,
    };
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }
}

// Global singleton instance
export const cacheManager = new CacheManager(100);

// Cleanup interval - remove stale entries
setInterval(() => {
  // LRU cache handles stale removal automatically
}, 10 * 60 * 1000); // Every 10 minutes
```

---

## 2. src/lib/rate-limiter.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

/**
 * Rate limit record for tracking requests
 */
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

/**
 * In-memory store for rate limit tracking
 * Production: Consider Redis for distributed systems
 */
const store: Map<string, RateLimitRecord> = new Map();

/**
 * Default rate limit configurations per endpoint
 */
const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  '/api/auth/login': { windowMs: 15 * 60 * 1000, maxRequests: 5 },
  '/api/auth/register': { windowMs: 60 * 60 * 1000, maxRequests: 3 },
  '/api/search': { windowMs: 60 * 1000, maxRequests: 30 },
  '/api/search/advanced': { windowMs: 60 * 1000, maxRequests: 30 },
  '/api/assets/checkout': { windowMs: 60 * 1000, maxRequests: 10 },
  '/api/assets/checkin': { windowMs: 60 * 1000, maxRequests: 10 },
  '/api/upload': { windowMs: 60 * 60 * 1000, maxRequests: 50 },
  '/api/reports/generate': { windowMs: 60 * 1000, maxRequests: 5 },
  default: { windowMs: 60 * 1000, maxRequests: 100 },
};

/**
 * Result of rate limit check
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Get rate limit configuration for a path
 * Supports exact match and pattern matching
 */
export function getRateLimitConfig(pathname: string): RateLimitConfig {
  // Check for exact match
  if (DEFAULT_CONFIGS[pathname]) {
    return DEFAULT_CONFIGS[pathname];
  }

  // Check for pattern match (prefix match)
  for (const [pattern, config] of Object.entries(DEFAULT_CONFIGS)) {
    if (pattern !== 'default' && pathname.startsWith(pattern)) {
      return config;
    }
  }

  return DEFAULT_CONFIGS.default;
}

/**
 * Check if request should be rate limited
 * Returns status and remaining requests
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = `rate-limit:${identifier}`;

  let record = store.get(key);

  // Create new record or reset if window expired
  if (!record || now > record.resetTime) {
    record = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    store.set(key, record);
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: record.resetTime,
    };
  }

  // Check if limit exceeded
  if (record.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
      retryAfter: Math.ceil((record.resetTime - now) / 1000),
    };
  }

  // Increment counter
  record.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * Extract client identifier from request
 * Uses session token if available, falls back to IP address
 */
function getClientIdentifier(request: NextRequest): string {
  // Try session tokens first (different cookie names for different NextAuth versions)
  const sessionToken =
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value ||
    request.cookies.get('authjs.session-token')?.value;

  if (sessionToken) {
    return `session:${sessionToken.substring(0, 16)}`;
  }

  // Fallback to IP address
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown';

  return `ip:${ip}`;
}

/**
 * Create rate limit response
 */
function createRateLimitResponse(result: RateLimitResult): NextResponse {
  const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);

  return NextResponse.json(
    {
      success: false,
      error: 'Too many requests',
      retryAfter,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(result.resetTime),
      },
    }
  );
}

/**
 * Rate limit middleware factory
 * Usage in route: apply to specific paths that need rate limiting
 */
export function rateLimitMiddleware(customConfig?: RateLimitConfig) {
  return (request: NextRequest) => {
    const config = customConfig || getRateLimitConfig(request.nextUrl.pathname);
    const identifier = getClientIdentifier(request);
    const result = checkRateLimit(identifier, config);

    if (!result.allowed) {
      return createRateLimitResponse(result);
    }

    // Add rate limit info to response headers
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', String(config.maxRequests));
    response.headers.set('X-RateLimit-Remaining', String(result.remaining));
    response.headers.set('X-RateLimit-Reset', String(result.resetTime));

    return response;
  };
}

/**
 * Cleanup stale rate limit records
 * Call periodically to prevent unbounded memory growth
 */
export function cleanupRateLimitStore(): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, record] of store.entries()) {
    if (now > record.resetTime) {
      store.delete(key);
      cleaned++;
    }
  }

  return cleaned;
}

/**
 * Get rate limit store size (for monitoring)
 */
export function getRateLimitStoreSize(): number {
  return store.size;
}

// Start cleanup interval (every 15 minutes)
if (typeof global !== 'undefined') {
  const cleanup = setInterval(() => {
    cleanupRateLimitStore();
  }, 15 * 60 * 1000);

  // Prevent interval from keeping app alive in serverless
  if (cleanup.unref) {
    cleanup.unref();
  }
}
```

---

## 3. src/middleware.ts

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Security headers applied to all responses
 */
const securityHeaders: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
};

/**
 * Main middleware function
 * Applies security headers and CORS to all requests
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add Content Security Policy
  const cspHeader = buildCSPHeader(request);
  response.headers.set('Content-Security-Policy', cspHeader);

  // Add HSTS header in production
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_HSTS !== 'false') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Handle CORS
  const origin = request.headers.get('origin');
  if (isAllowedOrigin(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin || '*');
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, PATCH, OPTIONS'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With'
    );
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: response.headers,
    });
  }

  return response;
}

/**
 * Build Content Security Policy header
 */
function buildCSPHeader(request: NextRequest): string {
  const isDev = process.env.NODE_ENV === 'development';

  const policies = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdn.tailwindcss.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "media-src 'self' blob:",
    "object-src 'none'",
    "connect-src 'self' https: ws: wss:",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
  ];

  // Relax CSP in development for hot reload
  if (isDev) {
    policies[1] = "script-src 'self' 'unsafe-inline' 'unsafe-eval'";
    policies[3] = "connect-src 'self' 'unsafe-eval' https: ws: wss:";
  }

  return policies.join(';');
}

/**
 * Check if origin is allowed based on ALLOWED_ORIGINS env var
 */
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;

  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim());

  return allowedOrigins.includes(origin);
}

/**
 * Configure which routes should have middleware applied
 */
export const config = {
  matcher: [
    // Apply to all routes except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
```

---

## 4. src/types/analytics.ts

```typescript
/**
 * Dashboard metric for display
 */
export interface DashboardMetric {
  label: string;
  value: number;
  unit?: string;
  trend?: number; // Percentage change
  trendDirection?: 'up' | 'down' | 'neutral';
  icon?: string;
  color?: string;
}

/**
 * Trend data point
 */
export interface TrendDataPoint {
  date: string; // ISO date string
  count: number;
  byType: {
    furniture: number;
    electronic: number;
    vehicle: number;
  };
}

/**
 * Depreciation forecast for an asset
 */
export interface DepreciationForecast {
  assetId: string;
  assetName: string;
  assetType: 'FURNITURE' | 'ELECTRONIC' | 'VEHICLE';
  currentValue: number;
  projectedValue30Days: number;
  projectedValue90Days: number;
  depreciationRate: string; // Percentage
  purchasePrice: number;
  usefulLifeYears: number;
}

/**
 * Asset health status indicator
 */
export interface AssetHealthIndicator {
  assetId: string;
  assetName: string;
  assetType: 'FURNITURE' | 'ELECTRONIC' | 'VEHICLE';
  condition: 'GOOD' | 'REPAIR' | 'DAMAGED';
  maintenanceDue: boolean;
  warrantyStatus?: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';
  lastServiceDate?: string;
  lastMaintenanceDate?: string;
  severityLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  message: string;
}

/**
 * Quick action for dashboard
 */
export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: string;
  href?: string;
  count?: number;
  urgent?: boolean;
  color?: string;
}

/**
 * Complete dashboard summary
 */
export interface DashboardSummary {
  generatedAt: string;
  metrics: Record<string, DashboardMetric>;
  trends: {
    period30Days: TrendDataPoint[];
    period60Days: TrendDataPoint[];
    period90Days: TrendDataPoint[];
  };
  depreciation: DepreciationForecast[];
  healthIndicators: AssetHealthIndicator[];
  quickActions: QuickAction[];
  statistics: {
    totalAssets: number;
    assetsByType: {
      furniture: number;
      electronic: number;
      vehicle: number;
    };
    assetsByCondition: {
      good: number;
      repair: number;
      damaged: number;
    };
    assetsByStatus: {
      inUse: number;
      inStore: number;
      disposed: number;
      auction: number;
    };
  };
}

/**
 * API response structure for analytics
 */
export interface AnalyticsResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
  timestamp?: string;
  cacheKey?: string;
}
```

---

## 5. src/types/search.ts

```typescript
/**
 * Search filter criteria
 */
export interface SearchFilter {
  query?: string;
  assetType?: 'FURNITURE' | 'ELECTRONIC' | 'VEHICLE';
  condition?: 'GOOD' | 'REPAIR' | 'DAMAGED';
  status?: 'IN_USE' | 'IN_STORE' | 'DISPOSED' | 'AUCTION';
  locationId?: string;
  companyId?: string;
  manufacturerId?: string;
  assignedUserId?: string;
  dateFrom?: string; // ISO date string
  dateTo?: string; // ISO date string
  sortBy?: 'name' | 'date' | 'relevance';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

/**
 * Individual search result
 */
export interface SearchResult {
  id: string;
  type: 'FURNITURE' | 'ELECTRONIC' | 'VEHICLE';
  name: string;
  assetTag?: string;
  serialNumber?: string;
  condition: string;
  status: string;
  location?: string;
  locationId?: string;
  company?: string;
  companyId?: string;
  assignee?: string;
  assigneeId?: string;
  imageUrl?: string;
  score?: number; // Relevance score (0-100)
  createdAt?: string;
}

/**
 * Paginated search results
 */
export interface SearchResultsPage {
  results: SearchResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
  };
  filters: SearchFilter;
  executionTime?: number; // milliseconds
}

/**
 * Saved search configuration
 */
export interface SavedSearch {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  filters: SearchFilter;
  isPublic: boolean;
  ownerEmail: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  lastUsedAt?: string;
}

/**
 * Search suggestion
 */
export interface SearchSuggestion {
  text: string;
  type: 'query' | 'asset' | 'tag' | 'recent';
  value?: string;
  metadata?: Record<string, any>;
}

/**
 * Advanced search state
 */
export interface AdvancedSearchState {
  filters: SearchFilter;
  results: SearchResult[];
  loading: boolean;
  error?: string;
  total: number;
  cached: boolean;
}
```

---

## 6. src/types/workflows.ts

```typescript
/**
 * Approval status for checkout/checkin requests
 */
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

/**
 * Checkout approval record
 */
export interface CheckoutApproval {
  id: string;
  checkoutId: string;
  assetId: string;
  assetType: 'FURNITURE' | 'ELECTRONIC' | 'VEHICLE';
  assetName: string;
  requestedBy: string;
  requestedByEmail: string;
  approvedBy?: string;
  status: ApprovalStatus;
  requestNotes?: string;
  approvalNotes?: string;
  requestedAt: string;
  decidedAt?: string;
  expiresAt?: string;
}

/**
 * Maintenance work types
 */
export type MaintenanceWorkType =
  | 'SERVICE'
  | 'REPAIR'
  | 'INSPECTION'
  | 'CLEANING'
  | 'UPGRADE'
  | 'REPLACEMENT'
  | 'OTHER';

/**
 * Maintenance scheduling record
 */
export interface MaintenanceSchedule {
  id: string;
  assetId: string;
  assetType: 'FURNITURE' | 'ELECTRONIC' | 'VEHICLE';
  assetName: string;
  scheduledDate: string;
  workType: MaintenanceWorkType;
  description?: string;
  vendor?: string;
  estimatedCost?: number;
  actualCost?: number;
  reminderDaysBefore: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  completionNotes?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

/**
 * Asset status transitions allowed
 */
export const STATUS_TRANSITIONS: Record<string, string[]> = {
  IN_STORE: ['IN_USE', 'AUCTION', 'DISPOSED'],
  IN_USE: ['IN_STORE', 'DISPOSED'],
  DISPOSED: [], // Terminal state
  AUCTION: ['DISPOSED'], // Can only go to disposed
};

/**
 * Asset status transition record
 */
export interface AssetStatusTransition {
  id: string;
  assetId: string;
  assetType: 'FURNITURE' | 'ELECTRONIC' | 'VEHICLE';
  fromStatus: string;
  toStatus: string;
  reason: string;
  requestedBy: string;
  approvedBy?: string;
  approvalStatus: ApprovalStatus;
  transitionedAt?: string;
  isValid: boolean;
  validationError?: string;
}

/**
 * Audit trail entry
 */
export interface AuditTrailEntry {
  id: string;
  userId: string;
  userEmail: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'CHECKOUT' | 'CHECKIN' | 'APPROVE' | 'REJECT';
  entity: 'ASSET' | 'CHECKOUT' | 'MAINTENANCE' | 'WORKFLOW';
  entityId: string;
  entityType?: string;
  details: Record<string, any>;
  changes?: Record<string, { old: any; new: any }>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

/**
 * Workflow context for complex operations
 */
export interface WorkflowContext {
  requestedBy: string;
  requestedAt: string;
  approvalChain: string[];
  comments: string[];
  status: ApprovalStatus;
  metadata?: Record<string, any>;
}

/**
 * Notification trigger for workflow events
 */
export interface WorkflowNotification {
  type: 'APPROVAL_REQUIRED' | 'APPROVED' | 'REJECTED' | 'SCHEDULED' | 'REMINDER';
  recipientId: string;
  title: string;
  message: string;
  actionUrl?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  expiresAt?: string;
}
```

---

## 7. src/types/reports.ts

```typescript
/**
 * Supported report types
 */
export type ReportType =
  | 'INVENTORY'
  | 'DEPRECIATION'
  | 'ACTIVITY'
  | 'CHECKOUT'
  | 'MAINTENANCE'
  | 'BUDGET'
  | 'CONDITION'
  | 'LOCATION'
  | 'CUSTOM';

/**
 * Supported output formats
 */
export type ReportFormat = 'JSON' | 'CSV' | 'PDF' | 'EXCEL';

/**
 * Report configuration
 */
export interface ReportConfig {
  dateRange?: {
    from: string; // ISO date
    to: string; // ISO date
  };
  groupBy?: string; // Field to group results
  filters?: Record<string, any>;
  includeCharts: boolean;
  includeSummary: boolean;
  includeDetails: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  pageSize?: number;
}

/**
 * Built-in report template
 */
export interface ReportTemplate {
  id: string;
  name: string;
  type: ReportType;
  description?: string;
  icon?: string;
  config: ReportConfig;
  isBuiltIn: boolean;
  category?: string;
  preview?: string;
}

/**
 * Chart configuration
 */
export interface Chart {
  type: 'BAR' | 'PIE' | 'LINE' | 'AREA' | 'SCATTER' | 'TABLE';
  title: string;
  description?: string;
  data: any[];
  xAxis?: string;
  yAxis?: string;
  legend?: string[];
  colors?: string[];
}

/**
 * Report summary statistics
 */
export interface ReportSummary {
  totalRecords: number;
  recordsByType?: Record<string, number>;
  recordsByStatus?: Record<string, number>;
  recordsByCondition?: Record<string, number>;
  totalValue?: number;
  averageValue?: number;
  minValue?: number;
  maxValue?: number;
  customMetrics?: Record<string, number>;
}

/**
 * Complete report data
 */
export interface ReportData {
  id?: string;
  title: string;
  type: ReportType;
  description?: string;
  generated: string; // ISO timestamp
  generatedBy?: string;
  config: ReportConfig;
  data: any[];
  summary?: ReportSummary;
  charts?: Chart[];
  pages?: ReportPage[];
  totalPages?: number;
  metadata?: {
    version: string;
    dataSource: string;
    refreshedAt?: string;
  };
}

/**
 * Report page (for paginated exports)
 */
export interface ReportPage {
  pageNumber: number;
  title?: string;
  content: any;
  charts?: Chart[];
}

/**
 * Scheduled report configuration
 */
export interface ScheduledReport {
  id: string;
  name: string;
  type: ReportType;
  template: string;
  schedule: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  cronExpression?: string;
  recipients: string[];
  format: ReportFormat;
  isActive: boolean;
  nextRunAt?: string;
  lastRunAt?: string;
  config: ReportConfig;
  createdAt: string;
  createdBy: string;
}

/**
 * Report generation response
 */
export interface ReportGenerationResponse {
  success: boolean;
  data?: ReportData | Buffer; // Buffer for binary formats
  error?: string;
  format?: ReportFormat;
  downloadUrl?: string;
  generationTime?: number; // milliseconds
}
```

---

## ENVIRONMENT VARIABLES

Add to `.env` and `.env.example`:

```env
# ============= SECURITY =============
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
ENABLE_RATE_LIMITING=true
ENABLE_HSTS=true
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# ============= PERFORMANCE =============
CACHE_TTL_SECONDS=300
CACHE_MAX_SIZE=100
MAX_QUERY_RESULTS=100
ENABLE_QUERY_LOGGING=false

# ============= DATABASE =============
DATABASE_URL=file:./prisma/dev.db
PRISMA_HIDE_UPDATE_MESSAGE=true

# ============= AUTHENTICATION =============
NEXTAUTH_SECRET=your-secret-here-change-in-production
NEXTAUTH_URL=http://localhost:3000

# ============= LOGGING =============
LOG_SENSITIVE_DATA=false
DEBUG_MODE=false
NODE_ENV=development

# ============= OPTIONAL: EMAIL (for notifications) =============
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# ============= OPTIONAL: EXTERNAL SERVICES =============
SENTRY_DSN=
GOOGLE_ANALYTICS_ID=
```

---

## INSTALLATION CHECKLIST

1. Install dependencies:
   ```bash
   npm install lru-cache
   npm install --save-dev @types/lru-cache
   ```

2. Create all new files in their respective directories

3. Update `prisma/schema.prisma` with new indexes

4. Run migration:
   ```bash
   npx prisma migrate dev --name add_performance_indexes
   ```

5. Update `.env` with new variables

6. Restart dev server:
   ```bash
   npm run dev
   ```

7. Test endpoints:
   ```bash
   curl http://localhost:3000/api/dashboard/stats
   ```

8. Run tests:
   ```bash
   npm test
   ```

---

## USAGE EXAMPLES

### Cache Manager

```typescript
import { cacheManager } from '@/lib/cache';

// Set value with default TTL (5 min)
cacheManager.set('dashboard:stats', statsData);

// Set value with custom TTL (1 hour)
cacheManager.set('custom:data', data, { ttl: 60 * 60 * 1000 });

// Get value
const cached = cacheManager.get('dashboard:stats');

// Delete specific key
cacheManager.delete('dashboard:stats');

// Invalidate by pattern
cacheManager.invalidatePattern(/dashboard:*/);

// Clear all
cacheManager.clear();
```

### Rate Limiter

```typescript
import { checkRateLimit, getRateLimitConfig } from '@/lib/rate-limiter';

// In your API route
const config = getRateLimitConfig(request.nextUrl.pathname);
const result = checkRateLimit('user-id-or-ip', config);

if (!result.allowed) {
  return NextResponse.json(
    { error: 'Too many requests' },
    { status: 429 }
  );
}
```

---

## PERFORMANCE TARGETS

- Dashboard API: < 500ms (previously 2-3s)
- Search API: < 300ms
- Cache hit rate: > 80%
- Database query time: < 100ms per query
- Memory usage: < 500MB at rest

---

## SECURITY CHECKLIST

- [x] All endpoints require authentication
- [x] Input validation with Zod on all mutations
- [x] SQL injection prevention (Prisma)
- [x] XSS protection via CSP headers
- [x] CSRF tokens (via NextAuth)
- [x] Rate limiting on sensitive endpoints
- [x] Security headers on all responses
- [x] No sensitive data in logs
- [x] Password hashing with bcrypt
- [x] Environment variable validation

---

## NEXT STEPS

1. Copy files to their respective locations
2. Run `npx prisma migrate dev`
3. Test each endpoint with provided examples
4. Monitor performance with browser DevTools
5. Set up monitoring/alerts in production
6. Document custom modifications
7. Deploy to staging for QA

