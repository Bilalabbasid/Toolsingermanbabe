export type CheckoutPlanId = 'pro';
export type CheckoutInterval = 'monthly' | 'yearly';

export interface CheckoutSelection {
  planId: CheckoutPlanId;
  interval: CheckoutInterval;
  priceId: string;
}

export class CheckoutSelectionError extends Error {
  constructor(
    public readonly code: 'INVALID_CHECKOUT_SELECTION' | 'PRICE_NOT_CONFIGURED',
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export function resolveCheckoutSelection(
  value: unknown,
  env: Readonly<Record<string, string | undefined>> = process.env,
): CheckoutSelection {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new CheckoutSelectionError('INVALID_CHECKOUT_SELECTION', 'Ungültige Tarifauswahl.', 400);
  }

  const { planId, interval } = value as Record<string, unknown>;
  if (planId !== 'pro' || (interval !== 'monthly' && interval !== 'yearly')) {
    throw new CheckoutSelectionError('INVALID_CHECKOUT_SELECTION', 'Dieser Tarif oder Abrechnungszeitraum ist nicht verfügbar.', 400);
  }

  const priceId = interval === 'yearly'
    ? env.STRIPE_PRICE_ID_PRO_YEARLY
    : env.STRIPE_PRICE_ID_PRO_MONTHLY || env.STRIPE_PRO_PRICE_ID;

  if (!priceId || !priceId.startsWith('price_')) {
    throw new CheckoutSelectionError(
      'PRICE_NOT_CONFIGURED',
      `Der ${interval === 'yearly' ? 'jährliche' : 'monatliche'} Pro-Preis ist nicht konfiguriert.`,
      503,
    );
  }

  return { planId, interval, priceId };
}
