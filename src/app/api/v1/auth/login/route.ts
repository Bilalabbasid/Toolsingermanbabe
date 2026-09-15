import { NextRequest, NextResponse } from 'next/server';
import { prisma, isDatabaseConfigured } from '@/server/db/prisma';
import { verifyPassword } from '@/server/auth/passwords';
import { createSession, SESSION_COOKIE_NAME, SESSION_EXPIRY_DAYS, SafeUser } from '@/server/auth/session';
import { getUserEntitlements } from '@/lib/monetization/entitlements';

import { rateLimiter, getClientIp } from '@/server/security/rateLimiter';
import { IS_PRODUCTION } from '@/config/env.config';

// Constant-time dummy hash to eliminate timing side-channel for account enumeration
const DUMMY_HASH = '$2a$12$e8rGgX1sXlM5F4Q2O1h3t.Y5xK9zH1jG2fD3sA4pL0oI9uY8tE7rW';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rate = rateLimiter.check(ip, 'auth');
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Zu viele Anmeldeversuche. Bitte warten Sie einen Moment vor dem nächsten Versuch.', code: 'RATE_LIMIT_EXCEEDED' },
        { status: 429, headers: { 'Retry-After': String(rate.resetSeconds) } }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Bitte E-Mail-Adresse und Passwort angeben.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail.length > 254 || !cleanEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Ungültige Anmeldedaten. Bitte überprüfen Sie Ihre Eingabe.' },
        { status: 401 }
      );
    }

    if (!isDatabaseConfigured()) {
      if (IS_PRODUCTION) {
        return NextResponse.json(
          { error: 'Authentifizierungsdienst vorübergehend nicht verfügbar.' },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: 'Datenbank ist nicht konfiguriert.' },
        { status: 503 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        subscription: true,
      },
    });

    if (!user || !user.passwordHash) {
      // Execute constant-time bcrypt to prevent account enumeration via timing
      await verifyPassword(password, DUMMY_HASH);
      return NextResponse.json(
        { error: 'Ungültige Anmeldedaten. Bitte überprüfen Sie Ihre Eingabe.' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Ungültige Anmeldedaten. Bitte überprüfen Sie Ihre Eingabe.' },
        { status: 401 }
      );
    }

    // Update lastLoginAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    }).catch(() => {});

    const plan = (user.subscription?.plan as 'free' | 'pro' | 'business') || 'free';

    const safeUser: SafeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'USER' | 'ADMIN',
      plan,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      lastLoginAt: new Date(),
    };

    const sessionToken = await createSession(safeUser.id, safeUser);
    const entitlements = getUserEntitlements(safeUser);

    const response = NextResponse.json({
      success: true,
      user: safeUser,
      entitlements,
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60,
    });

    return response;
  } catch (err: unknown) {
    console.error('[Login API Error]:', err);
    return NextResponse.json(
      { error: 'Fehler bei der Anmeldung. Bitte versuchen Sie es erneut.' },
      { status: 500 }
    );
  }
}
