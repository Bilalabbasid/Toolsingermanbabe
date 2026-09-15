import { NextRequest, NextResponse } from 'next/server';
import { getStripe, isStripeConfigured } from '@/server/stripe/client';
import { requireAuth } from '@/server/auth/guards';
import { prisma, isDatabaseConfigured } from '@/server/db/prisma';

export async function POST(req: NextRequest) {
  try {
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
    const origin = req.headers.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000';

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
