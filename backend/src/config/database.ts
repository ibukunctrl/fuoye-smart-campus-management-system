import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  global.prismaGlobal ||
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Neon serverless auto-suspends the DB branch after inactivity.
    // These settings make Prisma automatically reconnect when it wakes back up.
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Graceful reconnect on connection-closed errors (Neon auto-suspend)
// Prisma doesn't auto-reconnect by default on P1001/P1002 — we handle it here.
function withReconnect<T>(fn: () => Promise<T>): Promise<T> {
  return fn().catch(async (err) => {
    if (err?.code === 'P1001' || err?.code === 'P1002') {
      await prisma.$disconnect();
      await prisma.$connect();
      return fn();
    }
    throw err;
  });
}

// Patch the prisma client so all queries auto-retry once on DB disconnect
// (transparent to all callers — no changes needed elsewhere)
const originalRequest = (prisma as any)._engine?.request?.bind((prisma as any)._engine);
if (typeof originalRequest === 'function') {
  (prisma as any)._engine.request = (...args: any[]) =>
    withReconnect(() => originalRequest(...args));
}

if (env.NODE_ENV !== 'production') {
  global.prismaGlobal = prisma;
}

export async function connectDatabase() {
  try {
    await prisma.$connect();
    // Run a cheap query to wake Neon if it's suspended
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection established successfully');
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    throw err;
  }
}
