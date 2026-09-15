import { NextRequest, NextResponse } from 'next/server';
import { prisma, isDatabaseConfigured } from '@/server/db/prisma';
import { hashPassword } from '@/server/auth/passwords';
import { createSession, SESSION_COOKIE_NAME, SESSION_EXPIRY_DAYS, SafeUser } from '@/server/auth/session';
import { getUserEntitlements } from '@/lib/monetization/entitlements';

import { rateLimiter, getClientIp } from '@/server/security/rateLimiter';
import { IS_PRODUCTION } from '@/config/env.config';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rate = rateLimiter.check(ip, 'auth');
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Zu viele Registrierungsanfragen. Bitte warten Sie einen Moment.', code: 'RATE_LIMIT_EXCEEDED' },
        { status: 429, headers: { 'Retry-After': String(rate.resetSeconds) } }
      );
    }

    const body = await req.json();
    const { email, password, name } = body;

    if (!email || typeof email !== 'string' || !email.includes('@') || email.length > 254) {
      return NextResponse.json(
        { error: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    if (!password || typeof password !== 'string' || password.length < 8 || password.length > 128) {
      return NextResponse.json(
        { error: 'Das Passwort muss zwischen 8 und 128 Zeichen lang sein.' },
        { status: 400 }
      );
    }

    if (!isDatabaseConfigured()) {
      if (IS_PRODUCTION) {
        return NextResponse.json(
          { error: 'Registrierungsdienst vorübergehend nicht verfügbar.' },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: 'Datenbank ist nicht konfiguriert.' },
        { status: 503 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ein Benutzerkonto mit dieser E-Mail-Adresse existiert bereits.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    let safeUser: SafeUser;

    if (isDatabaseConfigured()) {
      const user = await prisma.user.create({
        data: {
          email: cleanEmail,
          passwordHash,
          name: name ? String(name).trim() : null,
          role: 'USER',
          subscription: {
            create: {
              plan: 'free',
              status: 'active',
            },
          },
        },
      });

      safeUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as 'USER' | 'ADMIN',
        plan: 'free',
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      };
    } else {
      // Memory fallback when DB is not configured
      safeUser = {
        id: 'user_' + Date.now(),
        email: cleanEmail,
        name: name ? String(name).trim() : null,
        role: 'USER',
        plan: 'free',
        emailVerified: null,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };
    }

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
    console.error('[Register API Error]:', err);
    return NextResponse.json(
      { error: 'Fehler bei der Registrierung. Bitte versuchen Sie es erneut.' },
      { status: 500 }
    );
  }
}
