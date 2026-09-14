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

export function resolveTierFromApiKey(apiKey?: string | null): SubscriptionTier {
  if (!apiKey) return 'free';
  if (apiKey.startsWith('biz_') || apiKey.startsWith('cw_biz_')) return 'business';
  return 'pro';
}

/**
 * Server-side subscription resolution from Request headers or cookies
 */
export function getServerSubscription(reqHeaders: Headers): UserSubscription {
  const apiKey = reqHeaders.get('x-api-key') || reqHeaders.get('authorization')?.replace('Bearer ', '');
  const cookieHeader = reqHeaders.get('cookie') || '';
  const isProCookie = cookieHeader.includes('coolwave_pro_active=true');

  let tier: SubscriptionTier = 'free';
  if (apiKey) {
    tier = resolveTierFromApiKey(apiKey);
  } else if (isProCookie) {
    tier = 'pro';
  }

  return {
    tier,
    isPro: tier === 'pro' || tier === 'business',
    status: tier === 'free' ? 'none' : 'active',
    entitlements: getEntitlements(tier),
  };
}

/**
 * Client-side subscription reader from localStorage / document.cookie
 */
export function getClientSubscription(): UserSubscription {
  if (typeof window === 'undefined') {
    return {
      tier: 'free',
      isPro: false,
      status: 'none',
      entitlements: getEntitlements('free'),
    };
  }

  const isProActive = localStorage.getItem('coolwave_pro_active') === 'true';
  const apiKey = localStorage.getItem('coolwave_api_key');

  let tier: SubscriptionTier = 'free';
  if (apiKey) {
    tier = resolveTierFromApiKey(apiKey);
  } else if (isProActive) {
    tier = 'pro';
  }

  return {
    tier,
    isPro: tier === 'pro' || tier === 'business',
    status: tier === 'free' ? 'none' : 'active',
    entitlements: getEntitlements(tier),
  };
}

export function setClientSubscription(tier: SubscriptionTier, active: boolean = true) {
  if (typeof window === 'undefined') return;

  if (active && tier !== 'free') {
    localStorage.setItem('coolwave_pro_active', 'true');
    document.cookie = `coolwave_pro_active=true; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
  } else {
    localStorage.removeItem('coolwave_pro_active');
    document.cookie = `coolwave_pro_active=false; path=/; max-age=0; SameSite=Lax`;
  }

  window.dispatchEvent(new Event('coolwave_subscription_changed'));
}
