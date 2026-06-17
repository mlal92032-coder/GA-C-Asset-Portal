import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Use file: URL format with forward slashes for cross-platform compatibility
  const dbAbsolutePath = path.join(process.cwd(), 'prisma', 'dev.db');
  const dbUrl = `file:${dbAbsolutePath.replace(/\\/g, '/')}`;

  const adapter = new PrismaBetterSqlite3({ url: dbUrl });

  return new PrismaClient({
    adapter,
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
