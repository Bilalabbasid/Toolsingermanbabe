import { getPlan, PlanEntitlements } from '@/config/plans.config';

export function getEntitlements(tier: string = 'free'): PlanEntitlements {
  const normalizedTier = (tier || 'free').toLowerCase();
  const plan = getPlan(normalizedTier);
  return plan.entitlements;
}

export function hasEntitlement(tier: string, entitlement: keyof PlanEntitlements): boolean {
  const entitlements = getEntitlements(tier);
  const val = entitlements[entitlement];
  return Boolean(val);
}

export function checkFileLimit(tier: string, fileSizeBytes: number): { allowed: boolean; maxAllowedMB: number } {
  const entitlements = getEntitlements(tier);
  const maxBytes = entitlements.maxFileSizeMB * 1024 * 1024;
  return {
    allowed: fileSizeBytes <= maxBytes,
    maxAllowedMB: entitlements.maxFileSizeMB,
  };
}

export function checkBatchLimit(tier: string, fileCount: number): { allowed: boolean; maxBatch: number } {
  const entitlements = getEntitlements(tier);
  return {
    allowed: fileCount <= entitlements.maxBatchFiles,
    maxBatch: entitlements.maxBatchFiles,
  };
}
