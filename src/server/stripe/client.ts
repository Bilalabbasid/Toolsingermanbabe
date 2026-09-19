import Stripe from 'stripe';
import { STRIPE_CONFIG } from '@/config/env.config';

export function isStripeConfigured(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_STRIPE === 'true' && STRIPE_CONFIG.isConfigured;
}

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!isStripeConfigured()) {
    return null;
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(STRIPE_CONFIG.secretKey, {
      apiVersion: '2025-02-24.acacia' as any,
      typescript: true,
    });
  }

  return stripeInstance;
}

export function getStripeClient(): Stripe {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error('STRIPE_SECRET_KEY ist nicht konfiguriert');
  }
  return stripe;
}
