import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { boundedBody, RequestError, requestError } from '@/server/security/request';

export async function POST(req: NextRequest) {
  try {
    const rawBody = Buffer.from(await boundedBody(req, 1024 * 1024)).toString('utf8');
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret || !signature) return NextResponse.json({ error: 'Webhook nicht autorisiert.' }, { status: 401 });

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

      if (!/^\d+$/.test(timestamp) || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300 ||
          !/^[a-f0-9]{64}$/.test(expectedSignature) ||
          !crypto.timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(expectedSignature, 'hex'))) {
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

    // No durable account/subscription store exists yet. Do not acknowledge delivery.
    return NextResponse.json({ error: 'Abonnement-Verarbeitung derzeit nicht verfuegbar.' }, { status: 503 });
  } catch (err: unknown) {
    if (err instanceof RequestError) return requestError(err);
    console.error('[Stripe Webhook Error]:', err);
    return NextResponse.json({ error: 'Interner Serverfehler bei Webhook-Verarbeitung.' }, { status: 500 });
  }
}
