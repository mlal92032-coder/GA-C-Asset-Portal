// src/middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, verifyRefreshToken } from '@/utils/security';
import { prisma } from '@/lib/prisma';

export async function authenticate(req: NextRequest): Promise<NextResponse | null> {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);

    try {
      const decoded = verifyJWT(token);

      // Verify user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user || user.status !== 'ACTIVE') {
        return NextResponse.json(
          { error: 'User not found or inactive' },
          { status: 401 }
        );
      }

      // Attach user to request
      (req as any).user = decoded;
      return null;
    } catch (error) {
      // Try refresh token
      const refreshToken = req.cookies.get('refreshToken')?.value;
      if (!refreshToken) {
        return NextResponse.json(
          { error: 'Token expired' },
          { status: 401 }
        );
      }

      try {
        const decoded = verifyRefreshToken(refreshToken);

        // Generate new access token
        const user = await prisma.user.findUnique({
          where: { id: decoded.id }
        });

        if (!user || user.status !== 'active') {
          return NextResponse.json(
            { error: 'User not found or inactive' },
            { status: 401 }
          );
        }

        const newAccessToken = generateJWT(user, '15m');

        (req as any).user = decoded;

        // Create response with new token
        const response = NextResponse.next();
        response.headers.set('x-new-access-token', newAccessToken);
        return response;
      } catch {
        return NextResponse.json(
          { error: 'Invalid refresh token' },
          { status: 401 }
        );
      }
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Multi-factor authentication middleware
export async function validateMFA(req: NextRequest, userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user?.twoFactorEnabled) {
    return true; // 2FA not enabled
  }

  const mfaToken = req.headers.get('x-mfa-token');
  if (!mfaToken) {
    return false;
  }

  // Verify MFA token from session
  const session = await prisma.session.findFirst({
    where: {
      userId,
      token: mfaToken
    }
  });

  return !!session;
}

// Session validation
export async function validateSession(req: NextRequest): Promise<boolean> {
  const token = req.headers.get('authorization')?.slice(7);
  if (!token) return false;

  try {
    const decoded = verifyJWT(token);

    const session = await prisma.session.findFirst({
      where: {
        userId: decoded.id,
        token,
        isValid: true,
        expiresAt: { gt: new Date() }
      }
    });

    return !!session;
  } catch {
    return false;
  }
}

// IP address validation for security
export async function validateIPAddress(req: NextRequest, userId: string): Promise<boolean> {
  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

  // Get user's trusted IPs
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) return false;

  // If user has trusted IPs configured, validate against them
  // This is a simplified example - implement based on your requirements
  return true;
}

// Rate limiting middleware
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export async function rateLimit(req: NextRequest, limit: number = 100, windowMs: number = 60000): Promise<void> {
  const identifier = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const now = Date.now();

  let data = rateLimitStore.get(identifier);

  if (!data || now > data.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    });
  } else {
    data.count++;
    if (data.count > limit) {
      throw new Error('Rate limit exceeded');
    }
  }
}

// CORS validation
export function validateCORS(req: NextRequest, allowedOrigins: string[]): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true;

  return allowedOrigins.some(allowed => {
    if (allowed === '*') return true;
    return origin === allowed;
  });
}
