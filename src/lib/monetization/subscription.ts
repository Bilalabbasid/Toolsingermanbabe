import { PlanEntitlements } from '@/config/plans.config';
import { getEntitlements } from './entitlements';

export type SubscriptionTier = 'free' | 'pro' | 'business';

export interface UserSubscription {
  tier: SubscriptionTier;
  isPro: boolean;
  status: 'active' | 'trialing' | 'canceled' | 'none';
  entitlements: PlanEntitlements;
  expiresAt?: string;
  stripeCustomerId?: string;
}

// Paid accounts are unavailable until durable server-side subscriptions are integrated.
// Neither localStorage, unsigned cookies nor key prefixes establish entitlement.
export function resolveTierFromApiKey(_apiKey?: string | null): SubscriptionTier { return 'free'; }
export function getServerSubscription(_headers: Headers): UserSubscription { return freeSubscription(); }
function freeSubscription(): UserSubscription { return { tier: 'free', isPro: false, status: 'none', entitlements: getEntitlements('free') }; }
export function getClientSubscription(): UserSubscription { return freeSubscription(); }
export function setClientSubscription(_tier: SubscriptionTier, _active = true) {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem('coolwave_pro_active'); } catch {}
  document.cookie = 'coolwave_pro_active=; path=/; max-age=0; SameSite=Lax';
  window.dispatchEvent(new Event('coolwave_subscription_changed'));
}
