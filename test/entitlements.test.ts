import { describe, it, expect } from 'vitest';
import { getUserEntitlements, validateActionEntitlement } from '@/lib/monetization/entitlements';

describe('Entitlements & Quotas', () => {
  it('should return Free tier entitlements for anonymous or free users', () => {
    const anonymousEntitlements = getUserEntitlements(null);
    expect(anonymousEntitlements.plan).toBe('free');
    expect(anonymousEntitlements.maxFileSizeMB).toBe(50);
    expect(anonymousEntitlements.batchFiles).toBe(3);
    expect(anonymousEntitlements.adsEnabled).toBe(true);

    const freeUser = {
      id: 'u1',
      email: 'free@coolwave.test',
      name: null,
      role: 'USER' as const,
      plan: 'free' as const,
      emailVerified: null,
      createdAt: new Date(),
      lastLoginAt: null,
    };

    const userEntitlements = getUserEntitlements(freeUser);
    expect(userEntitlements.plan).toBe('free');
    expect(userEntitlements.adsEnabled).toBe(true);
  });

  it('should return Pro tier entitlements with elevated limits and no ads', () => {
    const proUser = {
      id: 'u2',
      email: 'pro@coolwave.test',
      name: 'Pro User',
      role: 'USER' as const,
      plan: 'pro' as const,
      emailVerified: null,
      createdAt: new Date(),
      lastLoginAt: null,
    };

    const entitlements = getUserEntitlements(proUser);
    expect(entitlements.plan).toBe('pro');
    expect(entitlements.maxFileSizeMB).toBe(500);
    expect(entitlements.batchFiles).toBe(50);
    expect(entitlements.adsEnabled).toBe(false);
    expect(entitlements.priorityProcessing).toBe(true);
  });

  it('should validate action entitlements server-side', () => {
    const freeUser = {
      id: 'u1',
      email: 'free@coolwave.test',
      name: null,
      role: 'USER' as const,
      plan: 'free' as const,
      emailVerified: null,
      createdAt: new Date(),
      lastLoginAt: null,
    };

    // Free user within 50MB
    const validCheck = validateActionEntitlement(freeUser, 40 * 1024 * 1024, 2);
    expect(validCheck.allowed).toBe(true);

    // Free user exceeding 50MB
    const sizeCheck = validateActionEntitlement(freeUser, 60 * 1024 * 1024, 1);
    expect(sizeCheck.allowed).toBe(false);
    expect(sizeCheck.reason).toContain('Dateigröße');

    // Free user exceeding batch limit
    const batchCheck = validateActionEntitlement(freeUser, 10 * 1024 * 1024, 10);
    expect(batchCheck.allowed).toBe(false);
    expect(batchCheck.reason).toContain('Stapellimit');
  });
});
