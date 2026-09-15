import { NextRequest, NextResponse } from 'next/server';
import { getStripe, isStripeConfigured } from '@/server/stripe/client';
import { requireAuth } from '@/server/auth/guards';
import { prisma, isDatabaseConfigured } from '@/server/db/prisma';

import { rateLimiter, getClientIp } from '@/server/security/rateLimiter';
import { PUBLIC_CONFIG, IS_PRODUCTION } from '@/config/env.config';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rate = rateLimiter.check(ip, 'checkout');
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'RATE_LIMIT_EXCEEDED', message: 'Zu viele Anfragen.' },
        { status: 429, headers: { 'Retry-After': String(rate.resetSeconds) } }
      );
    }

    if (!isStripeConfigured()) {
      return NextResponse.json(
        {
          error: 'BILLING_UNAVAILABLE',
          message: 'Das Kundenportal ist derzeit nicht verfügbar.',
        },
        { status: 503 }
      );
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: 'BILLING_UNAVAILABLE' }, { status: 503 });
    }

    const user = await requireAuth(req);
    let origin = PUBLIC_CONFIG.siteUrl.replace(/\/+$/, '');
    if (!IS_PRODUCTION) {
      const clientOrigin = req.headers.get('origin');
      if (clientOrigin && (clientOrigin.includes('localhost') || clientOrigin.includes('127.0.0.1'))) {
        origin = clientOrigin;
      }
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'DATABASE_UNAVAILABLE' }, { status: 503 });
    }

    const sub = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    if (!sub || !sub.stripeCustomerId) {
      return NextResponse.json(
        { error: 'NO_CUSTOMER', message: 'Kein verknüpftes Stripe-Kundenkonto gefunden.' },
        { status: 404 }
      );
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${origin}/de/konto`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err: unknown) {
    console.error('[Stripe Portal Error]:', err);
    return NextResponse.json(
      { error: 'PORTAL_FAILED', message: 'Fehler beim Öffnen des Kundenportals.' },
      { status: 500 }
    );
  }
}
