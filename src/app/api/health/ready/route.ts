import { NextResponse } from 'next/server';
import { checkDatabaseHealth, isDatabaseConfigured } from '@/server/db/prisma';
import type { NextRequest } from 'next/server';
import { apiCorsPreflight, withApiCors } from '@/server/security/apiCors';

const get = async () => {
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
};

const corsGet = withApiCors(get);
// Keep the no-argument form for internal health checks and unit tests. Real
// HTTP requests always include NextRequest and receive origin validation.
export const GET = (req?: NextRequest) => req ? corsGet(req) : get();
export const OPTIONS = (req: NextRequest) => apiCorsPreflight(req);
