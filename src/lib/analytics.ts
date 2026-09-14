import { AnalyticsEventType } from '@/types/analytics';
import { getCookieConsent } from '@/components/common/CookieBanner';

interface ClientEventPayload {
  toolSlug?: string;
  category?: string;
  fileSizeBytes?: number;
  outputSizeBytes?: number;
  durationMs?: number;
  errorCode?: string;
  referrerSlug?: string;
  planId?: string;
  interval?: 'monthly' | 'yearly';
  triggerReason?: string;
}

/**
 * Gets the current active tool slug stored in sessionStorage for funnel attribution.
 */
export function getActiveToolSlug(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    return sessionStorage.getItem('cw_active_tool') || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Sets the active tool slug in sessionStorage.
 */
export function setActiveToolSlug(toolSlug: string): void {
  if (typeof window === 'undefined') return;
  if (!getCookieConsent()?.analytics) return;
  try {
    sessionStorage.setItem('cw_active_tool', toolSlug);
  } catch {
    // Ignore storage issues
  }
}

/**
 * Dispatches an analytics event to the backend using non-blocking transport.
 */
export function sendAnalyticsEvent(eventType: AnalyticsEventType, payload: ClientEventPayload = {}): void {
  if (typeof window === 'undefined') return;
  if (!getCookieConsent()?.analytics) return;

  const activeSlug = getActiveToolSlug();
  const eventData = {
    eventType,
    toolSlug: payload.toolSlug || activeSlug,
    referrerSlug: payload.referrerSlug || (payload.toolSlug !== activeSlug ? activeSlug : undefined),
    ...payload,
  };

  const jsonStr = JSON.stringify(eventData);

  // 1. Try sendBeacon for non-blocking unload-resilient delivery
  if (navigator.sendBeacon) {
    try {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const ok = navigator.sendBeacon('/api/v1/analytics/track', blob);
      if (ok) return;
    } catch {
      // fallback to fetch
    }
  }

  // 2. Fetch fallback with keepalive
  fetch('/api/v1/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: jsonStr,
    keepalive: true,
  }).catch(() => {
    // Silent fail to preserve user UX
  });
}

/**
 * Universal trackEvent function for engine telemetry compatibility.
 */
export function trackEvent(eventType: string, payload: Record<string, any> = {}): void {
  sendAnalyticsEvent(eventType as AnalyticsEventType, payload);
}

// Convenience Telemetry Helpers

export function trackToolView(toolSlug: string, category?: string): void {
  setActiveToolSlug(toolSlug);
  sendAnalyticsEvent('tool_view', { toolSlug, category });
}

export function trackUploadStarted(toolSlug: string, fileSizeBytes?: number): void {
  sendAnalyticsEvent('upload_started', { toolSlug, fileSizeBytes });
}

export function trackUploadCompleted(toolSlug: string, fileSizeBytes?: number): void {
  sendAnalyticsEvent('upload_completed', { toolSlug, fileSizeBytes });
}

export function trackConversionStarted(toolSlug: string): void {
  sendAnalyticsEvent('conversion_started', { toolSlug });
}

export function trackConversionCompleted(toolSlug: string, durationMs?: number, outputSizeBytes?: number): void {
  sendAnalyticsEvent('conversion_completed', { toolSlug, durationMs, outputSizeBytes });
}

export function trackConversionFailed(toolSlug: string, errorCode?: string): void {
  sendAnalyticsEvent('conversion_failed', { toolSlug, errorCode });
}

export function trackDownloadCompleted(toolSlug: string): void {
  sendAnalyticsEvent('download_completed', { toolSlug });
}

export function trackProViewed(triggerReason?: string, toolSlug?: string): void {
  sendAnalyticsEvent('pro_viewed', { triggerReason, toolSlug: toolSlug || getActiveToolSlug() });
}

export function trackProClicked(planId: string, interval?: 'monthly' | 'yearly', toolSlug?: string): void {
  sendAnalyticsEvent('pro_clicked', { planId, interval, toolSlug: toolSlug || getActiveToolSlug() });
}

export function trackSignupStarted(planId: string, toolSlug?: string): void {
  sendAnalyticsEvent('signup_started', { planId, toolSlug: toolSlug || getActiveToolSlug() });
}

export function trackSignupCompleted(planId: string, toolSlug?: string): void {
  sendAnalyticsEvent('signup_completed', { planId, toolSlug: toolSlug || getActiveToolSlug() });
}
