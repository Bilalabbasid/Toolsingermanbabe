import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, validatePasswordStrength } from '@/server/auth/passwords';
import { generateSessionToken, createSession, validateSessionToken } from '@/server/auth/session';
import { requireAuth, requireAdmin, AuthError } from '@/server/auth/guards';

describe('Authentication & Password Security', () => {
  it('should securely hash and verify passwords using bcrypt', async () => {
    const rawPassword = 'SuperSecretPassword123!';
    const hash = await hashPassword(rawPassword);

    expect(hash).not.toBe(rawPassword);
    expect(hash.startsWith('$2')).toBe(true);

    const isValid = await verifyPassword(rawPassword, hash);
    expect(isValid).toBe(true);

    const isInvalid = await verifyPassword('WrongPassword123!', hash);
    expect(isInvalid).toBe(false);
  });

  it('should enforce password strength requirements', () => {
    const tooShort = validatePasswordStrength('12345');
    expect(tooShort.valid).toBe(false);
    expect(tooShort.error).toContain('mindestens 8 Zeichen');

    const validPassword = validatePasswordStrength('CoolWavePass2026!');
    expect(validPassword.valid).toBe(true);
  });

  it('should generate cryptographically secure session tokens', () => {
    const token1 = generateSessionToken();
    const token2 = generateSessionToken();

    expect(token1).toBeDefined();
    expect(token1.length).toBe(64); // 32 bytes hex
    expect(token1).not.toBe(token2);
  });

  it('should handle sessions and role verification correctly in memory fallback', async () => {
    const mockUser = {
      id: 'test_user_1',
      email: 'user@coolwave.test',
      name: 'Test User',
      role: 'USER' as const,
      plan: 'free' as const,
      emailVerified: null,
      createdAt: new Date(),
      lastLoginAt: null,
    };

    const token = await createSession(mockUser.id, mockUser);
    const validated = await validateSessionToken(token);

    expect(validated).toBeDefined();
    expect(validated?.id).toBe(mockUser.id);
    expect(validated?.role).toBe('USER');
  });

  it('should block non-admins from requireAdmin', async () => {
    const normalUser = {
      id: 'user_norm',
      email: 'norm@test.com',
      name: 'Normal User',
      role: 'USER' as const,
      plan: 'free' as const,
      emailVerified: null,
      createdAt: new Date(),
      lastLoginAt: null,
    };

    const token = await createSession(normalUser.id, normalUser);
    const mockReq = new Request('http://localhost:3000/api/v1/admin/tools', {
      headers: { Authorization: `Bearer ${token}` },
    });

    await expect(requireAdmin(mockReq)).rejects.toThrow(AuthError);
  });

  it('should allow admins through requireAdmin', async () => {
    const adminUser = {
      id: 'user_admin',
      email: 'admin@coolwave.cool',
      name: 'Admin User',
      role: 'ADMIN' as const,
      plan: 'pro' as const,
      emailVerified: null,
      createdAt: new Date(),
      lastLoginAt: null,
    };

    const token = await createSession(adminUser.id, adminUser);
    const mockReq = new Request('http://localhost:3000/api/v1/admin/tools', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const user = await requireAdmin(mockReq);
    expect(user.role).toBe('ADMIN');
    expect(user.id).toBe(adminUser.id);
  });
});
