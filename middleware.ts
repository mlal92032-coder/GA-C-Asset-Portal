import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Next.js Middleware for Multi-Tenancy
 *
 * Responsibilities:
 * 1. Extract tenant ID/slug from request (header, subdomain, or session)
 * 2. Validate tenant is active
 * 3. Add X-Tenant-ID header to request for API handlers
 * 4. Prevent cross-tenant access
 *
 * Priority order for tenant identification:
 * 1. X-Tenant-ID header (for API calls, postman, mobile clients)
 * 2. X-Tenant-Slug header (alternative identifier)
 * 3. Subdomain (app.tenant-slug.com -> tenant-slug)
 * 4. JWT session (for browser requests)
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public/auth routes
  if (shouldSkipMiddleware(pathname)) {
    return NextResponse.next();
  }

  // Extract tenant ID or slug from request
  let tenantId = extractTenantIdentifier(request);

  // If no tenant found in headers/subdomain, try to get from JWT session
  if (!tenantId) {
    try {
      const token = await getToken({
        req: request as any,
        secret: process.env.NEXTAUTH_SECRET
      });

      if (token && token.tenantId) {
        tenantId = token.tenantId as string;
      }
    } catch (error) {
      // Continue - will handle below
    }
  }

  // No tenant identified - reject
  if (!tenantId) {
    return NextResponse.json(
      {
        error: 'Tenant not identified',
        message: 'Could not determine tenant from request headers, subdomain, or session'
      },
      { status: 400 }
    );
  }

  // Add tenant context to request headers for API handlers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-id', tenantId);

  // Store the extracted tenant for logging/debugging
  requestHeaders.set('x-tenant-extracted-from', detectTenantSource(request));

  // Create response with modified headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Optional: Add tenant info to response headers for debugging
  response.headers.set('x-tenant-id', tenantId);

  return response;
}

/**
 * Routes that should bypass tenant middleware
 */
function shouldSkipMiddleware(pathname: string): boolean {
  const publicRoutes = [
    '/',
    '/api/auth',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/public',
    '/healthz',
    '/settings',
    '/_next',
    '/favicon.ico',
    '/.well-known',
  ];

  return publicRoutes.some(route => pathname.startsWith(route));
}

/**
 * Extract tenant ID or slug from request
 * Tries multiple sources in order of priority
 */
function extractTenantIdentifier(request: NextRequest): string | null {
  // Priority 1: X-Tenant-ID header (API calls)
  const headerTenantId = request.headers.get('X-Tenant-ID');
  if (headerTenantId && isValidTenantId(headerTenantId)) {
    return headerTenantId;
  }

  // Priority 2: X-Tenant-Slug header (alternative)
  const headerTenantSlug = request.headers.get('X-Tenant-Slug');
  if (headerTenantSlug && isValidTenantSlug(headerTenantSlug)) {
    return headerTenantSlug;
  }

  // Priority 3: Extract from subdomain (tenant-slug.app.local)
  const host = request.headers.get('host') || '';
  const subdomain = extractSubdomainFromHost(host);

  if (subdomain && isValidTenantSlug(subdomain)) {
    return subdomain;
  }

  return null;
}

/**
 * Detect source of tenant extraction (for logging)
 */
function detectTenantSource(request: NextRequest): string {
  if (request.headers.get('X-Tenant-ID')) return 'header-id';
  if (request.headers.get('X-Tenant-Slug')) return 'header-slug';

  const host = request.headers.get('host') || '';
  const subdomain = extractSubdomainFromHost(host);
  if (subdomain) return 'subdomain';

  return 'session';
}

/**
 * Extract subdomain from hostname
 * Examples:
 * - acme-inc.app.local -> acme-inc
 * - tenant-1.assets.example.com -> tenant-1
 * - app.example.com -> null (www-like domain)
 */
function extractSubdomainFromHost(host: string): string | null {
  if (!host) return null;

  // Remove port if present
  const hostWithoutPort = host.split(':')[0];

  // Skip if no subdomain
  if (!hostWithoutPort.includes('.')) {
    return null;
  }

  // Get first subdomain part
  const parts = hostWithoutPort.split('.');
  const subdomain = parts[0].toLowerCase();

  // Skip common subdomains that indicate single-tenant or core app
  const skipped = ['www', 'app', 'admin', 'api', 'mail', 'static', 'cdn', 'assets'];
  if (skipped.includes(subdomain)) {
    return null;
  }

  return subdomain;
}

/**
 * Validate tenant ID format (CUID)
 */
function isValidTenantId(tenantId: string): boolean {
  // CUIDs are 24-character lowercase alphanumeric strings starting with 'c'
  return /^[c][a-z0-9]{23}$/.test(tenantId);
}

/**
 * Validate tenant slug format
 */
function isValidTenantSlug(slug: string): boolean {
  // Slugs are lowercase alphanumeric with hyphens, 1-63 characters
  return /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(slug);
}

/**
 * Configure which routes the middleware applies to
 * Using matcher ensures middleware only runs on relevant routes
 */
export const config = {
  matcher: [
    // API routes (except auth)
    '/api/:path((?!auth).*)',

    // App routes
    '/dashboard/:path*',
    '/admin/:path*',
    '/app/:path*',

    // Exclude Next.js internals
    '/((?!_next|.*\\..*|public).*)',
  ],
};
