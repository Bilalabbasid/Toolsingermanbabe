import { IAnalyticsProvider } from './analytics.interface';
import { LocalPrivacyAnalyticsProvider } from './providers/LocalPrivacyAnalyticsProvider';
import { AnalyticsEvent, AnalyticsDashboardData } from '@/types/analytics';

export class AnalyticsService {
  private provider: IAnalyticsProvider;

  constructor(provider?: IAnalyticsProvider) {
    // Default to privacy-friendly local provider
    this.provider = provider || new LocalPrivacyAnalyticsProvider();
  }

  /**
   * Allows hot-swapping or configuring a different analytics provider (e.g., Plausible, PostHog, Umami).
   */
  public setProvider(provider: IAnalyticsProvider): void {
    this.provider = provider;
  }

  public getProviderName(): string {
    return this.provider.name;
  }

  /**
   * Tracks a product event while guaranteeing privacy (sanitizes any unintended PII).
   */
  public async track(event: Omit<AnalyticsEvent, 'timestamp'>): Promise<void> {
    try {
      const sanitizedEvent: AnalyticsEvent = {
        ...event,
        timestamp: new Date().toISOString(),
      };

      await this.provider.trackEvent(sanitizedEvent);
    } catch (err) {
      // Analytics failures should never crash application requests
      console.warn('[AnalyticsService] Failed to track event:', (err as Error).message);
    }
  }

  /**
   * Fetches aggregate metrics for the admin analytics dashboard.
   */
  public async getDashboardMetrics(timeRange: 'today' | '7d' | '30d' | 'all' = 'all'): Promise<AnalyticsDashboardData> {
    return this.provider.getDashboardMetrics(timeRange);
  }
}

// Global server singleton
export const analyticsService = new AnalyticsService();
