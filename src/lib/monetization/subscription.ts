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
let cachedSubscription: UserSubscription = freeSubscription();
let hasInitiatedFetch = false;

export function resolveTierFromApiKey(_apiKey?: string | null): SubscriptionTier { return 'free'; }
export function getServerSubscription(_headers: Headers): UserSubscription { return freeSubscription(); }
function freeSubscription(): UserSubscription { return { tier: 'free', isPro: false, status: 'none', entitlements: getEntitlements('free') }; }

export function hydrateClientSubscription(user: { plan?: SubscriptionTier } | null): UserSubscription {
  const tier: SubscriptionTier = user?.plan === 'pro' || user?.plan === 'business' ? user.plan : 'free';
  cachedSubscription = {
    tier,
    isPro: tier === 'pro' || tier === 'business',
    status: user?.plan ? 'active' : 'none',
    entitlements: getEntitlements(tier),
  };
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('coolwave_subscription_changed'));
  }
  return cachedSubscription;
}

export function initClientSubscription(): void {
  if (typeof window === 'undefined' || hasInitiatedFetch) return;
  hasInitiatedFetch = true;
  fetch('/api/v1/auth/me')
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      hydrateClientSubscription(data?.user || null);
    })
    .catch(() => {
      hydrateClientSubscription(null);
    });
}

export function getClientSubscription(): UserSubscription {
  if (typeof window !== 'undefined' && !hasInitiatedFetch) {
    initClientSubscription();
  }
  return cachedSubscription;
}

export function setClientSubscription(_tier: SubscriptionTier, _active = true) {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem('coolwave_pro_active'); } catch {}
  document.cookie = 'coolwave_pro_active=; path=/; max-age=0; SameSite=Lax';
  window.dispatchEvent(new Event('coolwave_subscription_changed'));
}
