import { NextRequest, NextResponse } from 'next/server';
import { prisma, isDatabaseConfigured } from '@/server/db/prisma';
import { verifyPassword } from '@/server/auth/passwords';
import { createSession, SESSION_COOKIE_NAME, SESSION_EXPIRY_DAYS, SafeUser } from '@/server/auth/session';
import { getUserEntitlements } from '@/lib/monetization/entitlements';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Bitte E-Mail-Adresse und Passwort angeben.' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).toLowerCase().trim();

    let safeUser: SafeUser | null = null;

    if (isDatabaseConfigured()) {
      const user = await prisma.user.findUnique({
        where: { email: cleanEmail },
        include: {
          subscription: true,
        },
      });

      if (!user || !user.passwordHash) {
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

      safeUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as 'USER' | 'ADMIN',
        plan,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        lastLoginAt: new Date(),
      };
    } else {
      // Memory / local testing fallback if DB not configured
      safeUser = {
        id: 'user_' + Date.now(),
        email: cleanEmail,
        name: 'Test Benutzer',
        role: cleanEmail.includes('admin') ? 'ADMIN' : 'USER',
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
    console.error('[Login API Error]:', err);
    return NextResponse.json(
      { error: 'Fehler bei der Anmeldung. Bitte versuchen Sie es erneut.' },
      { status: 500 }
    );
  }
}
