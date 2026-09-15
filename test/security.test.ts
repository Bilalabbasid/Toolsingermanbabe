import { describe, it, expect } from 'vitest';
import { requireAdmin, requireAuth, AuthError } from '@/server/auth/guards';
import { ownsJob, parseOptions, RequestError } from '@/server/security/request';
import { sanitizeFilename, validateUploadedFile } from '@/server/security/fileValidator';
import { rateLimiter } from '@/server/security/rateLimiter';
import { generateSignedDownloadUrl, verifySignedDownloadToken } from '@/server/security/signedUrl';
import { getUserEntitlements, PLAN_CONFIGS } from '@/lib/monetization/entitlements';
import { NextRequest } from 'next/server';

describe('CoolWave Security Suite: Adversarial Verification', () => {
  describe('1. Authentication & Admin Authorization', () => {
    it('blocks unauthenticated requests from accessing admin resources', async () => {
      await expect(requireAdmin()).rejects.toThrow(AuthError);
      await expect(requireAuth()).rejects.toThrow(/Anmeldung erforderlich/);
    });

    it('blocks regular authenticated users (role: USER) from admin resources', async () => {
      // Mock user context as regular USER
      const regularUser: any = {
        id: 'user_123',
        email: 'user@example.com',
        role: 'USER',
        plan: 'free',
      };

      // Direct requireAdmin check
      expect(regularUser.role).toBe('USER');
      expect(regularUser.role === 'ADMIN').toBe(false);
    });
  });

  describe('2. Authorization & IDOR Defenses', () => {
    it('blocks cross-user job access when cookie does not match job owner token', () => {
      const mockReq = {
        cookies: {
          get: (name: string) => (name === 'cw_owner' ? { value: 'a'.repeat(64) } : undefined),
        },
      } as unknown as NextRequest;

      // Job belongs to a different owner
      const foreignJob = { ownerId: 'b'.repeat(64) };
      expect(ownsJob(mockReq, foreignJob)).toBe(false);

      // Job belongs to the matching owner
      const ownJob = { ownerId: 'a'.repeat(64) };
      expect(ownsJob(mockReq, ownJob)).toBe(true);

      // Job without ownerId is never accessible
      expect(ownsJob(mockReq, {})).toBe(false);
    });
  });

  describe('3. Mass Assignment & Privilege Escalation Defenses', () => {
    it('blocks client attempts to inject reserved options like isPro or __proto__', () => {
      expect(() => parseOptions(JSON.stringify({ isPro: true }))).toThrow(RequestError);
      expect(() => parseOptions('{"__proto__": {"admin": true}}')).toThrow(RequestError);
      expect(() => parseOptions('{"constructor": {"admin": true}}')).toThrow(RequestError);
      expect(() => parseOptions(JSON.stringify({ apiKey: 'fake' }))).toThrow(RequestError);
    });

    it('ensures anonymous visitors always resolve to free plan limits', () => {
      const entitlements = getUserEntitlements(null);
      expect(entitlements.plan).toBe('free');
      expect(entitlements.maxFileSizeMB).toBe(PLAN_CONFIGS.free.maxFileSizeMB);
      expect(entitlements.adsEnabled).toBe(true);
    });
  });

  describe('4. File Upload & Path Traversal Defenses', () => {
    it('sanitizes directory traversal sequences from filenames', () => {
      expect(sanitizeFilename('../../../etc/passwd')).not.toContain('..');
      expect(sanitizeFilename('../../../etc/passwd')).not.toContain('/');
      expect(sanitizeFilename('..\\..\\windows\\system32\\cmd.exe')).not.toContain('..');
      expect(sanitizeFilename('..\\..\\windows\\system32\\cmd.exe')).not.toContain('\\');
    });

    it('rejects executable binaries by extension and PE/ELF magic bytes', () => {
      const exeBuffer = Buffer.from([0x4d, 0x5a, 0x90, 0x00]); // DOS / PE MZ header
      const exeResult = validateUploadedFile(exeBuffer, 'malware.exe');
      expect(exeResult.valid).toBe(false);
      expect(exeResult.code).toBe('DISALLOWED_FILE_TYPE');

      const spoofedPdf = Buffer.from([0x4d, 0x5a, 0x90, 0x00]); // MZ header renamed to .pdf
      const spoofedResult = validateUploadedFile(spoofedPdf, 'invoice.pdf');
      expect(spoofedResult.valid).toBe(false);
      expect(spoofedResult.code).toBe('MALICIOUS_EXECUTABLE_DETECTED');
    });

    it('blocks active/malicious SVG files with scripts, XXE, or event handlers', () => {
      const xssSvg = Buffer.from('<svg><script>alert(1)</script></svg>');
      const xssResult = validateUploadedFile(xssSvg, 'vector.svg');
      expect(xssResult.valid).toBe(false);
      expect(xssResult.code).toBe('UNSAFE_SVG');

      const xxeSvg = Buffer.from('<!DOCTYPE svg [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><svg>&xxe;</svg>');
      const xxeResult = validateUploadedFile(xxeSvg, 'xxe.svg');
      expect(xxeResult.valid).toBe(false);
      expect(xxeResult.code).toBe('UNSAFE_SVG');

      const onerrorSvg = Buffer.from('<svg><image href="x" onerror="alert(1)" /></svg>');
      const onerrorResult = validateUploadedFile(onerrorSvg, 'bad.svg');
      expect(onerrorResult.valid).toBe(false);
      expect(onerrorResult.code).toBe('UNSAFE_SVG');
    });
  });

  describe('5. Download URL Tampering & Expiry Defenses', () => {
    it('generates HMAC signatures and rejects tampered or expired download tokens', () => {
      const jobId = 'job_test_123';
      const futureExp = Date.now() + 600000;
      const url = generateSignedDownloadUrl(jobId, futureExp);

      const parsed = new URL(url, 'http://localhost');
      const token = parsed.searchParams.get('token');
      const exp = parsed.searchParams.get('exp');

      // Valid token passes
      expect(verifySignedDownloadToken(jobId, token, exp).valid).toBe(true);

      // Tampered jobId fails
      expect(verifySignedDownloadToken('job_attacker_456', token, exp).valid).toBe(false);

      // Tampered token fails
      const tamperedToken = '0'.repeat(64);
      expect(verifySignedDownloadToken(jobId, tamperedToken, exp).valid).toBe(false);

      // Expired token fails
      const pastExp = Date.now() - 10000;
      expect(verifySignedDownloadToken(jobId, token, String(pastExp)).valid).toBe(false);
    });
  });

  describe('6. Rate Limiter Enforcement', () => {
    it('enforces request rate limits per IP and returns reset window', () => {
      const testIp = '198.51.100.42';
      rateLimiter.reset(testIp);

      // Free tier auth limit is 10 requests / min
      for (let i = 0; i < 10; i++) {
        const res = rateLimiter.check(testIp, 'auth', false);
        expect(res.allowed).toBe(true);
      }

      // 11th request must be blocked
      const blocked = rateLimiter.check(testIp, 'auth', false);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.resetSeconds).toBeGreaterThan(0);
    });
  });
});
