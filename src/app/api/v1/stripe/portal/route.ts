import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const body = await req.json().catch(() => ({}));
    const customerId = body.customerId || 'cus_test_dummy';
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (stripeSecretKey && customerId && !customerId.includes('_test')) {
      const params = new URLSearchParams();
      params.append('customer', customerId);
      params.append('return_url', `${origin}/de/preise`);

      const res = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'Portal-Sitzung konnte nicht erstellt werden.');
      }

      const session = await res.json();
      return NextResponse.json({ url: session.url });
    }

    return NextResponse.json({
      url: `${origin}/de/preise?portal=simulated`,
      mode: 'sandbox',
    });
  } catch (err: unknown) {
    console.error('[Stripe Portal Error]:', err);
    return NextResponse.json({ error: (err as Error).message || 'Serverfehler im Kundenportal.' }, { status: 500 });
  }
}
