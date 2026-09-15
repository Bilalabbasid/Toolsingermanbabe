import { NextResponse } from 'next/server';
import { checkDatabaseHealth, isDatabaseConfigured } from '@/server/db/prisma';

export async function GET() {
  // If database is explicitly configured, check that it can respond to query
  if (isDatabaseConfigured()) {
    const dbHealth = await checkDatabaseHealth();
    if (dbHealth.status !== 'ok') {
      return NextResponse.json(
        {
          ready: false,
          reason: 'Database configured but unreachable',
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }
  }

  return NextResponse.json({
    ready: true,
    timestamp: new Date().toISOString(),
  });
}
