import { NextRequest, NextResponse } from 'next/server';
import { getStripe, isStripeConfigured } from '@/server/stripe/client';
import { getCurrentUser } from '@/server/auth/guards';
import { prisma, isDatabaseConfigured } from '@/server/db/prisma';

import { rateLimiter, getClientIp } from '@/server/security/rateLimiter';
import { PUBLIC_CONFIG, IS_PRODUCTION } from '@/config/env.config';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rate = rateLimiter.check(ip, 'checkout');
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'RATE_LIMIT_EXCEEDED', message: 'Zu viele Anfragen. Bitte warten Sie einen Moment.' },
        { status: 429, headers: { 'Retry-After': String(rate.resetSeconds) } }
      );
    }

    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Bitte melden Sie sich an, um ein Abonnement abzuschließen.' },
        { status: 401 }
      );
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: 'SERVICE_UNAVAILABLE', message: 'Abonnement-Dienst ist vorübergehend nicht verfügbar (Datenbank nicht bereit).' },
        { status: 503 }
      );
    }

    if (!isStripeConfigured()) {
      return NextResponse.json(
        {
          error: 'BILLING_UNAVAILABLE',
          message: 'Das Bezahlsystem ist derzeit in Vorbereitung. Alle Pro-Funktionen stehen derzeit kostenlos zur Verfügung.',
        },
        { status: 503 }
      );
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: 'BILLING_UNAVAILABLE', message: 'Stripe konnte nicht initialisiert werden.' },
        { status: 503 }
      );
    }
    
    // Validate and anchor return origin to prevent Open Redirect attacks
    let origin = PUBLIC_CONFIG.siteUrl.replace(/\/+$/, '');
    if (!IS_PRODUCTION) {
      const clientOrigin = req.headers.get('origin');
      if (clientOrigin && (clientOrigin.includes('localhost') || clientOrigin.includes('127.0.0.1'))) {
        origin = clientOrigin;
      }
    }

    const priceId = process.env.STRIPE_PRO_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        { error: 'CONFIGURATION_ERROR', message: 'STRIPE_PRO_PRICE_ID ist nicht konfiguriert.' },
        { status: 500 }
      );
    }

    let customerId: string | undefined;

    const sub = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    if (sub?.stripeCustomerId) {
      customerId = sub.stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;

      await prisma.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          stripeCustomerId: customer.id,
          plan: 'free',
          status: 'active',
        },
        update: {
          stripeCustomerId: customer.id,
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/de/konto?checkout_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/de/preise?checkout_canceled=true`,
      metadata: {
        userId: user.id,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
        },
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error('[Stripe Checkout Error]:', err);
    return NextResponse.json(
      { error: 'CHECKOUT_FAILED', message: 'Fehler beim Erstellen der Checkout-Sitzung.' },
      { status: 500 }
    );
  }
}
