import { NextRequest } from 'next/server';

interface RateLimitBucket {
  timestamps: number[];
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

export type RateLimitAction = 'job' | 'batch' | 'download' | 'security';

interface ActionLimits {
  free: number;
  pro: number;
  windowMs: number;
}

const ACTION_LIMITS: Record<RateLimitAction, ActionLimits> = {
  job: { free: 30, pro: 150, windowMs: 60 * 1000 },
  batch: { free: 6, pro: 30, windowMs: 60 * 1000 },
  download: { free: 60, pro: 300, windowMs: 60 * 1000 },
  security: { free: 20, pro: 100, windowMs: 60 * 1000 },
};

class InMemoryRateLimiter {
  private buckets: Map<string, RateLimitBucket> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Periodically sweep buckets older than 2 minutes
    this.cleanupInterval = setInterval(() => {
      this.sweep();
    }, 2 * 60 * 1000);

    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  private sweep() {
    const now = Date.now();
    for (const [key, bucket] of this.buckets.entries()) {
      bucket.timestamps = bucket.timestamps.filter((ts) => now - ts < 2 * 60 * 1000);
      if (bucket.timestamps.length === 0) {
        this.buckets.delete(key);
      }
    }
  }

  public check(ip: string, action: RateLimitAction, isPro = false): RateLimitResult {
    const config = ACTION_LIMITS[action] || ACTION_LIMITS.job;
    const limit = isPro ? config.pro : config.free;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    const bucketKey = `${action}:${ip}`;
    let bucket = this.buckets.get(bucketKey);
    if (!bucket) {
      bucket = { timestamps: [] };
      this.buckets.set(bucketKey, bucket);
    }

    // Filter out timestamps outside the active window
    bucket.timestamps = bucket.timestamps.filter((ts) => ts > windowStart);

    const currentCount = bucket.timestamps.length;
    const remaining = Math.max(0, limit - currentCount);
    const oldestTimestamp = bucket.timestamps[0] || now;
    const resetSeconds = Math.max(1, Math.ceil((oldestTimestamp + config.windowMs - now) / 1000));

    if (currentCount >= limit) {
      return {
        allowed: false,
        limit,
        remaining: 0,
        resetSeconds,
      };
    }

    // Record this request
    bucket.timestamps.push(now);

    return {
      allowed: true,
      limit,
      remaining: Math.max(0, remaining - 1),
      resetSeconds,
    };
  }

  public reset(ip?: string) {
    if (ip) {
      for (const key of this.buckets.keys()) {
        if (key.endsWith(`:${ip}`)) {
          this.buckets.delete(key);
        }
      }
    } else {
      this.buckets.clear();
    }
  }
}

export const rateLimiter = new InMemoryRateLimiter();

/**
 * Extracts and normalizes client IP from incoming NextRequest
 */
export function getClientIp(req: NextRequest): string {
  // Configure only behind a proxy that overwrites this header and blocks direct access.
  const trustedHeader = process.env.TRUSTED_CLIENT_IP_HEADER;
  if (trustedHeader) {
    const value = req.headers.get(trustedHeader)?.trim();
    if (value && value.length <= 45 && /^[a-fA-F0-9:.]+$/.test(value)) return value;
  }
  return 'untrusted-origin';
}
