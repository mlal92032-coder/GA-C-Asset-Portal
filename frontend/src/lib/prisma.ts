import { PrismaClient } from '@prisma/client';

// Use DATABASE_URL environment variable for PostgreSQL (Vercel) or local development
const dbUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/asset_management';

console.log('[PRISMA] Initializing with DB:', dbUrl.split('@')[0] + '@...');

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});

export default prisma;

console.log('[PRISMA] Client exported successfully');
