import { NextRequest, NextResponse } from 'next/server';
import { getStripe, isStripeConfigured } from '@/server/stripe/client';
import { prisma, isDatabaseConfigured } from '@/server/db/prisma';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json({ received: true, ignored: 'Stripe not configured' });
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not initialized' }, { status: 500 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn('[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured, skipping verification.');
      return NextResponse.json({ error: 'Webhook secret not set' }, { status: 500 });
    }

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid signature';
      console.error('[Stripe Webhook Signature Error]:', msg);
      return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 });
    }

    if (!isDatabaseConfigured()) {
      console.warn('[Stripe Webhook] Database not configured, returning 503 so Stripe will retry:', event.type);
      return NextResponse.json({ error: 'DATABASE_UNAVAILABLE' }, { status: 503 });
    }

    // Webhook Idempotency & Replay Defense: Ignore already-processed event IDs
    const existingLog = await prisma.auditLog.findFirst({
      where: {
        action: 'STRIPE_WEBHOOK_PROCESSED',
        targetId: event.id,
      },
    });

    if (existingLog) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    // Process event types and record audit log atomically
    await prisma.$transaction(async (tx) => {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const customerId = session.customer as string;
          const subscriptionId = session.subscription as string;
          const userId = session.metadata?.userId;

          if (userId && userId !== 'anonymous') {
            await tx.subscription.upsert({
              where: { userId },
              create: {
                userId,
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId,
                plan: 'pro',
                status: 'active',
              },
              update: {
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId,
                plan: 'pro',
                status: 'active',
              },
            });
          }
          break;
        }

        case 'customer.subscription.updated':
        case 'customer.subscription.created': {
          const sub = event.data.object as Stripe.Subscription;
          const customerId = sub.customer as string;
          const status = sub.status; // 'active', 'past_due', 'canceled', etc.
          const priceId = sub.items.data[0]?.price?.id;
          const plan = status === 'active' || status === 'trialing' ? 'pro' : 'free';
          const currentPeriodEnd = new Date((sub as any).current_period_end * 1000);
          const cancelAtPeriodEnd = sub.cancel_at_period_end;

          await tx.subscription.updateMany({
            where: { stripeCustomerId: customerId },
            data: {
              stripeSubscriptionId: sub.id,
              stripePriceId: priceId,
              status,
              plan,
              currentPeriodEnd,
              cancelAtPeriodEnd,
            },
          });
          break;
        }

        case 'customer.subscription.deleted': {
          const sub = event.data.object as Stripe.Subscription;
          const customerId = sub.customer as string;

          await tx.subscription.updateMany({
            where: { stripeCustomerId: customerId },
            data: {
              status: 'canceled',
              plan: 'free',
              cancelAtPeriodEnd: false,
            },
          });
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          const customerId = invoice.customer as string;

          await tx.subscription.updateMany({
            where: { stripeCustomerId: customerId },
            data: {
              status: 'past_due',
            },
          });
          break;
        }

        case 'invoice.paid': {
          const invoice = event.data.object as Stripe.Invoice;
          const customerId = invoice.customer as string;

          await tx.subscription.updateMany({
            where: { stripeCustomerId: customerId },
            data: {
              status: 'active',
              plan: 'pro',
            },
          });
          break;
        }

        default:
          // Unhandled event type
          break;
      }

      // Persist processed event ID in audit logs for idempotency atomically with mutation
      await tx.auditLog.create({
        data: {
          action: 'STRIPE_WEBHOOK_PROCESSED',
          targetType: 'StripeEvent',
          targetId: event.id,
          metadata: JSON.stringify({ type: event.type, timestamp: new Date().toISOString() }),
        },
      });
    });

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    console.error('[Stripe Webhook Handler Error]:', err);
    return NextResponse.json({ error: 'Internal webhook error' }, { status: 500 });
  }
}
