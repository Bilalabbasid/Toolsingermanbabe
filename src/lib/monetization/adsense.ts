import { adsConfig, isAdsEnabled } from '@/config/ads.config';
import { getClientSubscription } from '@/lib/monetization/subscription';
import { getCookieConsent } from '@/components/common/CookieBanner';

let isScriptInjected = false;

export function canDisplayAds(): boolean {
  if (!isAdsEnabled()) return false;

  // 1. Pro users receive ZERO ads
  const sub = getClientSubscription();
  if (sub.isPro || sub.entitlements.noAds) {
    return false;
  }

  // 2. Consent check (ePrivacy & GDPR)
  const consent = getCookieConsent();
  if (!consent || !consent.marketing) {
    return false;
  }

  return true;
}

export function loadAdSenseScript(): boolean {
  if (typeof window === 'undefined') return false;
  if (isScriptInjected) return true;

  if (!canDisplayAds()) {
    return false;
  }

  const clientId = adsConfig.clientId;
  if (!clientId || !clientId.startsWith('ca-pub-')) {
    // In development or when publisher ID is not configured, we do not inject external scripts
    return false;
  }

  try {
    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
    isScriptInjected = true;
    return true;
  } catch (err) {
    console.error('[AdSense] Failed to inject AdSense script:', err);
    return false;
  }
}

export function requestAdRender(elementId: string): void {
  if (typeof window === 'undefined') return;
  if (!canDisplayAds()) return;

  try {
    // @ts-expect-error window.adsbygoogle is injected by Google AdSense
    const adsbygoogle = window.adsbygoogle || [];
    adsbygoogle.push({});
  } catch (err) {
    // Graceful fallback if ad-blocker is active
  }
}
