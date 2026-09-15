import { describe, it, expect } from 'vitest';
import { isStripeConfigured, getStripeClient } from '@/server/stripe/client';

describe('Stripe Billing & Graceful Fallback', () => {
  it('should report unconfigured safely when STRIPE_SECRET_KEY is absent', () => {
    const configured = isStripeConfigured();
    expect(typeof configured).toBe('boolean');

    if (!configured) {
      expect(() => getStripeClient()).toThrow(/STRIPE_SECRET_KEY ist nicht konfiguriert/);
    }
  });

  it('should not crash when checking webhook signature validation logic', async () => {
    const { POST } = await import('@/app/api/v1/stripe/webhook/route');
    const mockReq = new Request('http://localhost:3000/api/v1/stripe/webhook', {
      method: 'POST',
      body: JSON.stringify({ type: 'test' }),
      headers: { 'stripe-signature': 'invalid_sig' },
    });

    const res = await POST(mockReq as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.received).toBe(true);
  });
});

