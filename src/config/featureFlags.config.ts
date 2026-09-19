export interface FeatureFlags {
  enableAds: boolean;
  enableAccounts: boolean;
  enableStripeCheckout: boolean;
  enableConversionHistory: boolean;
  enablePriorityQueue: boolean;
  enableBusinessTier: boolean;
  enableUsageTracking: boolean;
}

export const featureFlags: FeatureFlags = {
  enableAds: process.env.NEXT_PUBLIC_ENABLE_ADS !== 'false', // Enabled by default for free traffic
  // Keep account code dormant for the anonymous tools-only launch. Set this to
  // true later to restore login, registration and account navigation.
  enableAccounts: process.env.NEXT_PUBLIC_ENABLE_ACCOUNTS === 'true',
  // Billing is opt-in. A deployment without payment credentials must never
  // expose a checkout flow that can only fail after the user clicks it.
  enableStripeCheckout: process.env.NEXT_PUBLIC_ENABLE_STRIPE === 'true',
  enableConversionHistory:
    process.env.NEXT_PUBLIC_ENABLE_ACCOUNTS === 'true' &&
    process.env.NEXT_PUBLIC_ENABLE_HISTORY === 'true',
  enablePriorityQueue: process.env.NEXT_PUBLIC_ENABLE_PRIORITY_QUEUE !== 'false',
  enableBusinessTier: process.env.NEXT_PUBLIC_ENABLE_BUSINESS_TIER !== 'false',
  enableUsageTracking: process.env.NEXT_PUBLIC_ENABLE_USAGE_TRACKING !== 'false',
};

export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  return featureFlags[flag];
}
