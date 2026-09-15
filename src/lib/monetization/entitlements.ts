import { SafeUser } from '@/server/auth/session';

export type PlanType = 'free' | 'pro' | 'business';

export interface UserEntitlements {
  plan: PlanType;
  maxFileSizeMB: number;
  maxBatchFiles: number;
  dailyConversions: number; // -1 for unlimited
  ocrPagesPerMonth: number;
  priorityProcessing: boolean;
  adsEnabled: boolean;
  conversionConcurrency: number;
  historyRetentionDays: number;
  advancedToolsEnabled: boolean;
  batchFiles: number;
}

export const PLAN_CONFIGS: Record<PlanType, UserEntitlements> = {
  free: {
    plan: 'free',
    maxFileSizeMB: 50,
    maxBatchFiles: 3,
    batchFiles: 3,
    dailyConversions: 20,
    ocrPagesPerMonth: 10,
    priorityProcessing: false,
    adsEnabled: true,
    conversionConcurrency: 1,
    historyRetentionDays: 1,
    advancedToolsEnabled: false,
  },
  pro: {
    plan: 'pro',
    maxFileSizeMB: 500,
    maxBatchFiles: 50,
    batchFiles: 50,
    dailyConversions: -1, // unlimited
    ocrPagesPerMonth: 500,
    priorityProcessing: true,
    adsEnabled: false,
    conversionConcurrency: 5,
    historyRetentionDays: 90,
    advancedToolsEnabled: true,
  },
  business: {
    plan: 'business',
    maxFileSizeMB: 2000,
    maxBatchFiles: 100,
    batchFiles: 100,
    dailyConversions: -1, // unlimited
    ocrPagesPerMonth: 2500,
    priorityProcessing: true,
    adsEnabled: false,
    conversionConcurrency: 10,
    historyRetentionDays: 365,
    advancedToolsEnabled: true,
  },
};

/**
 * Returns the exact entitlements for a given user or anonymous visitor
 */
export function getUserEntitlements(user?: SafeUser | null): UserEntitlements {
  if (!user) {
    return PLAN_CONFIGS.free;
  }

  const plan = user.plan || 'free';
  const base = PLAN_CONFIGS[plan] || PLAN_CONFIGS.free;

  // Admins always have full business entitlements
  if (user.role === 'ADMIN') {
    return {
      ...PLAN_CONFIGS.business,
      adsEnabled: false,
    };
  }

  return base;
}

/**
 * Validates whether a file upload/conversion request satisfies user entitlements
 */
export function validateEntitlements(
  entitlements: UserEntitlements,
  fileSizeBytes: number,
  batchCount: number
): { valid: boolean; reason?: string } {
  const maxBytes = entitlements.maxFileSizeMB * 1024 * 1024;

  if (fileSizeBytes > maxBytes) {
    return {
      valid: false,
      reason: `Dateigröße (${(fileSizeBytes / (1024 * 1024)).toFixed(1)} MB) überschreitet das Limit Ihres Tarifs (${entitlements.maxFileSizeMB} MB).`,
    };
  }

  if (batchCount > entitlements.maxBatchFiles) {
    return {
      valid: false,
      reason: `Die Anzahl der Dateien (${batchCount}) überschreitet das Stapellimit Ihres Tarifs (${entitlements.maxBatchFiles}).`,
    };
  }

  return { valid: true };
}

/**
 * Server-side helper to validate actions against current user
 */
export function validateActionEntitlement(
  user: SafeUser | null,
  fileSizeBytes: number,
  batchCount: number
): { allowed: boolean; reason?: string } {
  const entitlements = getUserEntitlements(user);
  const result = validateEntitlements(entitlements, fileSizeBytes, batchCount);
  return {
    allowed: result.valid,
    reason: result.reason,
  };
}

export function getEntitlements(plan: PlanType = 'free'): any {
  const cfg = PLAN_CONFIGS[plan] || PLAN_CONFIGS.free;
  return {
    ...cfg,
    noAds: !cfg.adsEnabled,
    priorityQueue: cfg.priorityProcessing,
  };
}

export function hasEntitlement(plan: PlanType, feature: string): boolean {
  const e = getEntitlements(plan);
  return Boolean(e[feature]);
}

export function checkFileLimit(plan: PlanType, fileSizeBytes: number): { allowed: boolean; maxMB: number } {
  const e = getEntitlements(plan);
  return {
    allowed: fileSizeBytes <= e.maxFileSizeMB * 1024 * 1024,
    maxMB: e.maxFileSizeMB,
  };
}

export function checkBatchLimit(plan: PlanType, count: number): { allowed: boolean; maxBatch: number } {
  const e = getEntitlements(plan);
  return {
    allowed: count <= e.maxBatchFiles,
    maxBatch: e.maxBatchFiles,
  };
}


