export interface FeatureFlags {
  enableAds: boolean;
  enableStripeCheckout: boolean;
  enableConversionHistory: boolean;
  enablePriorityQueue: boolean;
  enableBusinessTier: boolean;
  enableUsageTracking: boolean;
}

export const featureFlags: FeatureFlags = {
  enableAds: process.env.NEXT_PUBLIC_ENABLE_ADS !== 'false', // Enabled by default for free traffic
  enableStripeCheckout: process.env.NEXT_PUBLIC_ENABLE_STRIPE !== 'false',
  enableConversionHistory: process.env.NEXT_PUBLIC_ENABLE_HISTORY !== 'false',
  enablePriorityQueue: process.env.NEXT_PUBLIC_ENABLE_PRIORITY_QUEUE !== 'false',
  enableBusinessTier: process.env.NEXT_PUBLIC_ENABLE_BUSINESS_TIER !== 'false',
  enableUsageTracking: process.env.NEXT_PUBLIC_ENABLE_USAGE_TRACKING !== 'false',
};

export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  return featureFlags[flag];
}
