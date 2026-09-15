import crypto from 'crypto';
import { cookies } from 'next/headers';
import { prisma, isDatabaseConfigured } from '@/server/db/prisma';

export const SESSION_COOKIE_NAME = 'cw_session';
export const SESSION_EXPIRY_DAYS = 30;

export interface SafeUser {
  id: string;
  email: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
  plan: 'free' | 'pro' | 'business';
  emailVerified: Date | null;
  createdAt: Date;
  lastLoginAt: Date | null;
}

// In-memory session store fallback if database is not yet connected
const memorySessions = new Map<string, { userId: string; expiresAt: Date; user: SafeUser }>();

/**
 * Generates a cryptographically secure random session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Creates a new session in database or memory fallback
 */
export async function createSession(userId: string, safeUserFallback?: SafeUser): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  if (isDatabaseConfigured()) {
    try {
      await prisma.session.create({
        data: {
          sessionToken: token,
          userId,
          expiresAt,
        },
      });
      return token;
    } catch (err) {
      console.warn('[Session] Database session creation failed, falling back to memory store:', err);
    }
  }

  // Memory fallback
  if (safeUserFallback) {
    memorySessions.set(token, { userId, expiresAt, user: safeUserFallback });
  }

  return token;
}

/**
 * Validates a session token and retrieves the associated user
 */
export async function validateSessionToken(token: string): Promise<SafeUser | null> {
  if (!token) return null;

  if (isDatabaseConfigured()) {
    try {
      const session = await prisma.session.findUnique({
        where: { sessionToken: token },
        include: {
          user: {
            include: {
              subscription: true,
            },
          },
        },
      });

      if (!session) return null;

      // Check expiry
      if (session.expiresAt < new Date()) {
        await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
        return null;
      }

      const plan = (session.user.subscription?.plan as 'free' | 'pro' | 'business') || 'free';

      return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role as 'USER' | 'ADMIN',
        plan,
        emailVerified: session.user.emailVerified,
        createdAt: session.user.createdAt,
        lastLoginAt: session.user.lastLoginAt,
      };
    } catch (err) {
      console.warn('[Session] Database session validation failed, checking memory:', err);
    }
  }

  // Check memory store
  const memSession = memorySessions.get(token);
  if (!memSession) return null;

  if (memSession.expiresAt < new Date()) {
    memorySessions.delete(token);
    return null;
  }

  return memSession.user;
}

/**
 * Invalidates / destroys a session token
 */
export async function destroySession(token: string): Promise<void> {
  if (!token) return;

  memorySessions.delete(token);

  if (isDatabaseConfigured()) {
    try {
      await prisma.session.delete({ where: { sessionToken: token } });
    } catch {
      // Ignore if already deleted
    }
  }
}

/**
 * Reads the session token from the active request cookies
 */
export async function getSessionTokenFromCookie(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(SESSION_COOKIE_NAME);
    return cookie ? cookie.value : null;
  } catch {
    return null;
  }
}
