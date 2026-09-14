import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // Verify webhook signature if secret is configured
    if (webhookSecret && signature) {
      const parts = signature.split(',').reduce((acc, part) => {
        const [k, v] = part.split('=');
        if (k && v) acc[k.trim()] = v.trim();
        return acc;
      }, {} as Record<string, string>);

      const timestamp = parts.t;
      const expectedSignature = parts.v1;

      if (!timestamp || !expectedSignature) {
        return NextResponse.json({ error: 'Ungültige Signatur-Header.' }, { status: 400 });
      }

      const signedPayload = `${timestamp}.${rawBody}`;
      const hmac = crypto.createHmac('sha256', webhookSecret).update(signedPayload).digest('hex');

      if (hmac !== expectedSignature) {
        return NextResponse.json({ error: 'Signatur-Verifikation fehlgeschlagen.' }, { status: 400 });
      }
    }

    let event;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Ungültiges JSON-Format.' }, { status: 400 });
    }

    const eventType = event.type;
    console.log(`[Stripe Webhook Received]: ${eventType}`);

    switch (eventType) {
      case 'checkout.session.completed': {
        const session = event.data?.object;
        console.log(`[Stripe] Checkout abgeschlossen für Kunde: ${session?.customer || session?.client_reference_id}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data?.object;
        console.log(`[Stripe] Abonnement aktualisiert: ${subscription?.id}, Status: ${subscription?.status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data?.object;
        console.log(`[Stripe] Abonnement beendet: ${subscription?.id}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data?.object;
        console.log(`[Stripe] Rechnung bezahlt: ${invoice?.id}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data?.object;
        console.warn(`[Stripe] Zahlung fehlgeschlagen für Rechnung: ${invoice?.id}`);
        break;
      }

      default:
        console.log(`[Stripe] Nicht behandelter Event-Typ: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    console.error('[Stripe Webhook Error]:', err);
    return NextResponse.json({ error: 'Interner Serverfehler bei Webhook-Verarbeitung.' }, { status: 500 });
  }
}
