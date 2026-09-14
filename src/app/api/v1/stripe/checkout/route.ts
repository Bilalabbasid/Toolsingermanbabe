import { NextRequest, NextResponse } from 'next/server';
import { getPlan } from '@/config/plans.config';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const planId = body.planId || 'pro';
    const interval = body.interval === 'yearly' ? 'yearly' : 'monthly';
    const plan = getPlan(planId);

    if (plan.id === 'free') {
      return NextResponse.json({ error: 'Kostenloser Tarif erfordert keine Zahlung.' }, { status: 400 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // If Stripe Secret Key is present, create actual Stripe Checkout Session
    if (stripeSecretKey) {
      const priceId = interval === 'yearly' ? plan.stripePriceIdYearly : plan.stripePriceIdMonthly;
      const params = new URLSearchParams();
      params.append('payment_method_types[]', 'card');
      params.append('payment_method_types[]', 'sepa_debit');
      params.append('mode', 'subscription');
      params.append('success_url', `${origin}/de/preise?session_id={CHECKOUT_SESSION_ID}&success=true`);
      params.append('cancel_url', `${origin}/de/preise?canceled=true`);
      params.append('client_reference_id', `user_${Date.now()}`);

      if (priceId && !priceId.includes('_test')) {
        params.append('line_items[0][price]', priceId);
        params.append('line_items[0][quantity]', '1');
      } else {
        // Fallback dynamically generated price data if Price ID is placeholder
        const unitAmount = Math.round((interval === 'yearly' ? plan.priceYearlyEUR : plan.priceMonthlyEUR) * 100);
        params.append('line_items[0][price_data][currency]', 'eur');
        params.append('line_items[0][price_data][product_data][name]', plan.name);
        params.append('line_items[0][price_data][unit_amount]', unitAmount.toString());
        params.append('line_items[0][price_data][recurring][interval]', interval === 'yearly' ? 'year' : 'month');
        params.append('line_items[0][quantity]', '1');
      }

      const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!stripeRes.ok) {
        const errorData = await stripeRes.json();
        console.error('[Stripe API Error]:', errorData);
        throw new Error(errorData.error?.message || 'Stripe Session Erstellung fehlgeschlagen');
      }

      const session = await stripeRes.json();
      return NextResponse.json({
        sessionId: session.id,
        url: session.url,
        mode: 'live',
      });
    }

    // Mock / Sandbox mode when Stripe is not yet wired to live credentials
    const mockSessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const mockCheckoutUrl = `${origin}/de/preise?sandbox_pro=activated&plan=${plan.id}&interval=${interval}`;

    return NextResponse.json({
      sessionId: mockSessionId,
      url: mockCheckoutUrl,
      mode: 'sandbox',
      message: 'Stripe Sandbox-Modus: Umleitung zur Pro-Aktivierung.',
    });
  } catch (err: unknown) {
    console.error('[Stripe Checkout Error]:', err);
    return NextResponse.json(
      { error: (err as Error).message || 'Fehler beim Erstellen der Checkout-Sitzung.' },
      { status: 500 }
    );
  }
}
