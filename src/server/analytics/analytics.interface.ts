import { AnalyticsEvent, AnalyticsDashboardData } from '@/types/analytics';

export interface IAnalyticsProvider {
  readonly name: string;
  trackEvent(event: AnalyticsEvent): Promise<void>;
  getDashboardMetrics(timeRange?: 'today' | '7d' | '30d' | 'all'): Promise<AnalyticsDashboardData>;
}
