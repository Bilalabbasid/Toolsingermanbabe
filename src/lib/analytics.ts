export type AnalyticsEvent = 
  | 'tool_view'
  | 'upload_started'
  | 'upload_completed'
  | 'conversion_started'
  | 'conversion_completed'
  | 'download_completed'
  | 'conversion_failed'
  | 'pro_clicked'
  | 'search_performed'
  | 'metadata_inspected'
  | 'metadata_strip_started'
  | 'metadata_strip_completed'
  | 'page_organize_started'
  | 'page_organize_completed';

interface EventProperties {
  toolSlug?: string;
  category?: string;
  fileSize?: number;
  durationMs?: number;
  error?: string;
  [key: string]: unknown;
}

export function trackEvent(event: AnalyticsEvent, properties?: EventProperties) {
  if (typeof window === 'undefined') return;

  // In production, integrate with Google Tag Manager / PostHog / Plausible without cookies
  try {
    const hasConsent = localStorage.getItem('coolwave_cookie_consent');
    const parsedConsent = hasConsent ? JSON.parse(hasConsent) : null;
    
    // Only dispatch to external trackers if analytics consent is granted
    if (parsedConsent?.analytics) {
      const win = window as unknown as { gtag?: (...args: unknown[]) => void };
      if (typeof win.gtag === 'function') {
        win.gtag('event', event, properties);
      }
    }

    // Local anonymous diagnostics logging for dev/testing
    if (process.env.NODE_ENV === 'development') {
      console.log(`[CoolWave Analytics] ${event}:`, properties);
    }
  } catch {
    // Fail silently without disrupting user experience
  }
}
