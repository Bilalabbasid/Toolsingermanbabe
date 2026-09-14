import { privacyConfig } from '@/config/privacy.config';

/**
 * Anonymizes an IP address (IPv4 masked to /24, IPv6 masked to /48)
 * strictly adhering to GDPR / DSGVO minimal data requirements.
 */
export function anonymizeIp(ip?: string | null): string {
  if (!ip || !privacyConfig.anonymizeIp) return ip || 'unknown';

  // Strip port if present
  const cleanIp = ip.split(':')[0].includes('.') ? ip.split(':')[0] : ip;

  // IPv4 check
  if (cleanIp.includes('.')) {
    const parts = cleanIp.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
    }
  }

  // IPv6 check
  if (cleanIp.includes(':')) {
    const parts = cleanIp.split(':');
    if (parts.length >= 3) {
      return `${parts[0]}:${parts[1]}:${parts[2]}::`;
    }
  }

  return 'anonymized';
}

/**
 * Minimal logging utility that strips confidential or high-entropy data
 * (passwords, tokens, raw file contents) before writing to console.
 */
export function privacyLog(level: 'info' | 'warn' | 'error', message: string, metadata?: Record<string, unknown>) {
  const sanitizedMeta: Record<string, unknown> = {};

  if (metadata) {
    for (const [key, value] of Object.entries(metadata)) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('password') ||
        lowerKey.includes('secret') ||
        lowerKey.includes('token') ||
        lowerKey.includes('buffer') ||
        lowerKey.includes('filecontent') || lowerKey.includes('error') || lowerKey.includes('filename') || lowerKey.includes('path')
      ) {
        sanitizedMeta[key] = '[REDACTED]';
      } else if (lowerKey.includes('ip')) {
        sanitizedMeta[key] = anonymizeIp(String(value));
      } else if (typeof value === 'string' && value.length > 300) {
        sanitizedMeta[key] = `${value.slice(0, 300)}...[TRUNCATED]`;
      } else {
        sanitizedMeta[key] = value;
      }
    }
  }

  const timestamp = new Date().toISOString();
  const logPayload = {
    timestamp,
    level,
    message,
    ...(Object.keys(sanitizedMeta).length > 0 ? { context: sanitizedMeta } : {}),
  };

  if (level === 'error') {
    console.error(JSON.stringify(logPayload));
  } else if (level === 'warn') {
    console.warn(JSON.stringify(logPayload));
  } else {
    console.log(JSON.stringify(logPayload));
  }
}
