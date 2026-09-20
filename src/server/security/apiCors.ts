import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_ALLOWED_ORIGINS = ['https://coolwave.cool', 'https://www.coolwave.cool'];

function normalizeOrigin(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function allowedOrigins(req: NextRequest): Set<string> {
  const configured = (process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => normalizeOrigin(value.trim()))
    .filter((value): value is string => Boolean(value));
  const origins = new Set([...DEFAULT_ALLOWED_ORIGINS, ...configured, req.nextUrl.origin]);
  if (process.env.NODE_ENV !== 'production') {
    origins.add('http://localhost:3000');
    origins.add('http://localhost:3001');
  }
  return origins;
}

function requestOrigin(req: NextRequest): string | null {
  const origin = req.headers.get('origin');
  return origin ? normalizeOrigin(origin) : null;
}

function isAllowed(req: NextRequest): boolean {
  const origin = requestOrigin(req);
  return !origin || allowedOrigins(req).has(origin);
}

function addCorsHeaders(req: NextRequest, response: Response): Response {
  const origin = requestOrigin(req);
  if (!origin || !allowedOrigins(req).has(origin)) return response;
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length, X-Output-Filename, Retry-After, X-RateLimit-Limit, X-RateLimit-Remaining');
  response.headers.append('Vary', 'Origin');
  return response;
}

type ApiHandler<Args extends unknown[]> = (req: NextRequest, ...args: Args) => Response | Promise<Response>;

export function withApiCors<Args extends unknown[]>(handler: ApiHandler<Args>): ApiHandler<Args> {
  return async (req, ...args) => {
    if (process.env.COOLWAVE_DEPLOYMENT_ROLE === 'frontend' && req.nextUrl.pathname !== '/api/health/ready') {
      return addCorsHeaders(req, NextResponse.json(
        { error: 'Dateiverarbeitung ist nur über den CoolWave-Konvertierungsdienst verfügbar.', code: 'REMOTE_API_REQUIRED' },
        { status: 503 }
      ));
    }
    if (!isAllowed(req)) {
      return NextResponse.json({ error: 'Dieser Anfrage-Ursprung ist nicht erlaubt.', code: 'ORIGIN_NOT_ALLOWED' }, { status: 403 });
    }
    return addCorsHeaders(req, await handler(req, ...args));
  };
}

export function apiCorsPreflight(req: NextRequest): Response {
  if (!isAllowed(req)) {
    return NextResponse.json({ error: 'Dieser Anfrage-Ursprung ist nicht erlaubt.', code: 'ORIGIN_NOT_ALLOWED' }, { status: 403 });
  }
  const response = new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      'Access-Control-Max-Age': '86400',
      'Cache-Control': 'public, max-age=86400',
    },
  });
  return addCorsHeaders(req, response);
}
