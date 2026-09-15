import { NextResponse } from 'next/server';
import { checkDatabaseHealth, isDatabaseConfigured } from '@/server/db/prisma';
import { isStripeConfigured } from '@/server/stripe/client';

export async function GET() {
  const dbHealth = await checkDatabaseHealth();
  const stripeConfigured = isStripeConfigured();
  const r2Configured = Boolean(
    process.env.R2_ENDPOINT &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET
  );
  const redisConfigured = Boolean(process.env.REDIS_URL);

  const status = dbHealth.status === 'ok' || !isDatabaseConfigured() ? 'ok' : 'degraded';

  return NextResponse.json({
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
    version: process.env.npm_package_version || '1.0.0',
  });
}
