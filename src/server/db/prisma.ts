import { PrismaClient } from '@prisma/client';
import { DATABASE_CONFIG, IS_PRODUCTION } from '@/config/env.config';

declare global {
  // Allow global `var` declarations in TypeScript
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export function isDatabaseConfigured(): boolean {
  return DATABASE_CONFIG.isConfigured;
}

function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: !IS_PRODUCTION ? ['warn', 'error'] : ['error'],
    datasources: {
      db: {
        url: DATABASE_CONFIG.url || 'postgresql://placeholder:placeholder@localhost:5432/placeholder',
      },
    },
  });

  return client;
}

export const prisma: PrismaClient = globalThis.prismaGlobal ?? createPrismaClient();

if (!IS_PRODUCTION) {
  globalThis.prismaGlobal = prisma;
}

/**
 * Health check helper for database connectivity
 */
export async function checkDatabaseConnection(): Promise<{ ok: boolean; error?: string; latencyMs?: number }> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: 'DATABASE_URL is not configured' };
  }

  const start = Date.now();
  try {
    // Perform simple query to verify connection
    await prisma.$queryRawUnsafe('SELECT 1');
    return { ok: true, latencyMs: Date.now() - start };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown database connection error';
    return { ok: false, error: message, latencyMs: Date.now() - start };
  }
}

/**
 * Health check alias returning structured status
 */
export async function checkDatabaseHealth(): Promise<{ status: 'ok' | 'offline'; latencyMs?: number }> {
  const res = await checkDatabaseConnection();
  return {
    status: res.ok ? 'ok' : 'offline',
    latencyMs: res.latencyMs,
  };
}

