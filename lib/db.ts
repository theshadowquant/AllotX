import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Fix SQLite file path for Vercel Serverless Functions on Linux
if (process.env.VERCEL) {
  try {
    const tmpDir = '/tmp';
    const tmpDbPath = path.join(tmpDir, 'dev.db');

    if (!fs.existsSync(tmpDbPath)) {
      const sourceDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
      const rootDbPath = path.join(process.cwd(), 'dev.db');

      if (fs.existsSync(sourceDbPath)) {
        fs.copyFileSync(sourceDbPath, tmpDbPath);
      } else if (fs.existsSync(rootDbPath)) {
        fs.copyFileSync(rootDbPath, tmpDbPath);
      }
    }
    process.env.DATABASE_URL = `file:${tmpDbPath}`;
  } catch (err) {
    console.warn('Could not copy SQLite db to /tmp on Vercel:', err);
    process.env.DATABASE_URL = 'file:./dev.db';
  }
} else if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
