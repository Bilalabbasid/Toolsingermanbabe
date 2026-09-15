import { NextRequest, NextResponse } from 'next/server';
import { checkDatabaseHealth, isDatabaseConfigured } from '@/server/db/prisma';
import { isStripeConfigured } from '@/server/stripe/client';
import { isAdminRequest } from '@/server/security/request';

export async function GET(req?: NextRequest) {
  const dbHealth = await checkDatabaseHealth();
  const status = dbHealth.status === 'ok' || !isDatabaseConfigured() ? 'ok' : 'degraded';

  const stripeConfigured = isStripeConfigured();

  // Check if caller is authorized admin for full internal diagnostics
  const isAdmin = await isAdminRequest(req);
  if (!isAdmin) {
    return NextResponse.json(
      {
        status,
        timestamp: new Date().toISOString(),
        database: {
          status: dbHealth.status,
          configured: isDatabaseConfigured(),
        },
        stripe: {
          configured: stripeConfigured,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'X-Robots-Tag': 'noindex, nofollow',
        },
      }
    );
  }

  const r2Configured = Boolean(
    process.env.R2_ENDPOINT &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET
  );
  const redisConfigured = Boolean(process.env.REDIS_URL);

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        configured: isDatabaseConfigured(),
        status: dbHealth.status,
        latencyMs: dbHealth.latencyMs,
      },
      stripe: {
        configured: stripeConfigured,
        mode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? 'live' : 'test',
      },
      storage: {
        r2Configured,
        provider: r2Configured ? 'Cloudflare R2' : 'Local Ephemeral',
      },
      redis: {
        configured: redisConfigured,
      },
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
