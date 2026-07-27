import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const dbUrl = `file:${dbPath.replace(/\\/g, '/')}`;

console.log('[PRISMA] Initializing with DB:', dbUrl);

const adapter = new PrismaBetterSqlite3({ url: dbUrl });
export const prisma = new PrismaClient({ adapter });

export default prisma;

console.log('[PRISMA] Client exported successfully');
