export type AnalyticsEventType =
  | 'tool_view'
  | 'upload_started'
  | 'upload_completed'
  | 'conversion_started'
  | 'conversion_completed'
  | 'conversion_failed'
  | 'download_completed'
  | 'pro_viewed'
  | 'pro_clicked'
  | 'signup_started'
  | 'signup_completed';

export interface AnalyticsEvent {
  id?: string;
  eventType: AnalyticsEventType;
  timestamp: string; // ISO date string
  toolSlug?: string;
  category?: string;
  sourceFormat?: string;
  targetFormat?: string;
  fileSizeBytes?: number;
  outputSizeBytes?: number;
  durationMs?: number;
  isPro?: boolean;
  engine?: 'browser' | 'server';
  errorCode?: string;
  referrerSlug?: string;
  planId?: string;
  interval?: 'monthly' | 'yearly';
  triggerReason?: string;
}

export interface ToolPerformanceMetric {
  toolSlug: string;
  toolName: string;
  category: string;
  views: number;
  uploadsStarted: number;
  uploadsCompleted: number;
  conversionsStarted: number;
  conversionsCompleted: number;
  conversionsFailed: number;
  downloadsCompleted: number;
  successRate: number; // percentage 0 - 100
  failureRate: number; // percentage 0 - 100
  avgProcessingTimeMs: number;
  avgInputSizeBytes: number;
  avgOutputSizeBytes: number;
  totalComputeMs: number;
  totalBandwidthBytes: number;
  infrastructureCostScore: number; // calculated relative index
  proAttributedViews: number;
  proAttributedClicks: number;
  proAttributedSignups: number;
}

export interface CategoryUsageMetric {
  category: string;
  views: number;
  conversions: number;
  percentage: number;
}

export interface ProFunnelMetric {
  proViewedTotal: number;
  proClickedTotal: number;
  signupStartedTotal: number;
  signupCompletedTotal: number;
  viewToClickRate: number; // percentage
  clickToSignupRate: number; // percentage
  topTriggerTools: { toolSlug: string; toolName: string; count: number }[];
}

export interface AnalyticsDashboardData {
  timeRange: 'today' | '7d' | '30d' | 'all';
  updatedAt: string;
  overview: {
    totalToolViews: number;
    totalConversionsCompleted: number;
    totalConversionsFailed: number;
    overallSuccessRate: number;
    avgProcessingTimeMs: number;
    totalBandwidthMB: number;
    totalProConversions: number;
    activeToolsCount: number;
  };
  tools: ToolPerformanceMetric[];
  categories: CategoryUsageMetric[];
  proFunnel: ProFunnelMetric;
  infrastructureTopExpensive: {
    toolSlug: string;
    toolName: string;
    avgTimeMs: number;
    avgSizeMB: number;
    costScore: number;
    reason: string;
  }[];
  organicLandingPages: {
    toolSlug: string;
    toolName: string;
    views: number;
    conversionRate: number;
  }[];
}
