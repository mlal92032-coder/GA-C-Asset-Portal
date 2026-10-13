// src/utils/security.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-encryption-key-32-chars-here!';

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// JWT token management
export function generateJWT(user: any, expiresIn: string = '15m'): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn }
  );
}

export function generateRefreshToken(user: any): string {
  return jwt.sign(
    {
      id: user.id,
      organizationId: user.organizationId
    },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyJWT(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export function verifyRefreshToken(token: string): any {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

// 2FA/MFA
export async function generateTwoFactorSecret(email: string): Promise<{ secret: string; qrCode: string }> {
  const secret = speakeasy.generateSecret({
    name: `Asset Management System (${email})`,
    issuer: 'Asset Management',
    length: 32
  });

  const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

  return {
    secret: secret.base32,
    qrCode
  };
}

export function verifyTOTP(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2
  });
}

export function generateBackupCodes(count: number = 10): string[] {
  return Array.from({ length: count }, () =>
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );
}

// Encryption/Decryption (for sensitive data)
export function encryptData(data: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY.padEnd(32)),
    iv
  );
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export function decryptData(encryptedData: string): string {
  const [ivHex, encrypted] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY.padEnd(32)),
    iv
  );
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Rate limiting tokens
export function generateRateLimitToken(identifier: string, limit: number = 100, windowMs: number = 60000): string {
  const timestamp = Math.floor(Date.now() / windowMs);
  const data = `${identifier}:${timestamp}:${limit}`;
  return crypto
    .createHmac('sha256', process.env.RATE_LIMIT_SECRET || 'secret')
    .update(data)
    .digest('hex');
}

// Generate secure random string
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

// IP address validation
export function isValidIPAddress(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([\da-f]{0,4}:){2,7}[\da-f]{0,4}$/i;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

// CORS origin validation
export function isValidOrigin(origin: string, allowedOrigins: string[]): boolean {
  return allowedOrigins.some(allowed => {
    if (allowed === '*') return true;
    if (allowed.startsWith('http://') || allowed.startsWith('https://')) {
      try {
        const url = new URL(origin);
        const allowedUrl = new URL(allowed);
        return url.origin === allowedUrl.origin;
      } catch {
        return false;
      }
    }
    return origin === allowed;
  });
}

// CSRF token generation
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function validateCSRFToken(token: string, storedToken: string): boolean {
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(storedToken));
}
