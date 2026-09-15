import { getSessionTokenFromCookie, validateSessionToken, SafeUser } from './session';

export class AuthError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode = 401, code = 'UNAUTHORIZED') {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * Retrieves the authenticated user for the current request context, or null if anonymous
 */
export async function getCurrentUser(req?: Request): Promise<SafeUser | null> {
  // 1. Check Bearer token in Authorization header if present
  if (req) {
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      const user = await validateSessionToken(token);
      if (user) return user;
    }
  }

  // 2. Check HTTP-only cookie
  const cookieToken = await getSessionTokenFromCookie();
  if (cookieToken) {
    const user = await validateSessionToken(cookieToken);
    if (user) return user;
  }

  return null;
}

/**
 * Requires authentication. Throws AuthError(401) if not logged in.
 */
export async function requireAuth(req?: Request): Promise<SafeUser> {
  const user = await getCurrentUser(req);
  if (!user) {
    throw new AuthError('Anmeldung erforderlich. Bitte melden Sie sich an.', 401, 'UNAUTHORIZED');
  }
  return user;
}

/**
 * Requires ADMIN role. Throws AuthError(401) if not logged in, or AuthError(403) if not an admin.
 */
export async function requireAdmin(req?: Request): Promise<SafeUser> {
  const user = await requireAuth(req);
  if (user.role !== 'ADMIN') {
    throw new AuthError('Zugriff verweigert. Administrator-Rechte erforderlich.', 403, 'FORBIDDEN');
  }
  return user;
}
