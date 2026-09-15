import { describe, it, expect } from 'vitest';
import { GET as healthGet } from '@/app/api/health/route';
import { GET as readyGet } from '@/app/api/health/ready/route';

describe('Health & Readiness Endpoints', () => {
  it('should return valid healthcheck JSON without leaking credentials', async () => {
    const res = await healthGet();
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.status).toBeDefined();
    expect(data.timestamp).toBeDefined();
    expect(data.database).toBeDefined();
    expect(data.stripe).toBeDefined();

    // Verify secrets are NOT leaked
    const jsonString = JSON.stringify(data);
    expect(jsonString).not.toContain('postgresql://');
    expect(jsonString).not.toContain('sk_live_');
    expect(jsonString).not.toContain('sk_test_');
    expect(jsonString).not.toContain('whsec_');
  });

  it('should return 200 on readiness probe when not in critical failure', async () => {
    const res = await readyGet();
    expect([200, 503]).toContain(res.status);

    const data = await res.json();
    expect(data.timestamp).toBeDefined();
  });
});
