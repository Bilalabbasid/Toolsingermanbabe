import crypto from 'crypto';
import { privacyConfig } from '@/config/privacy.config';

const signingGlobal = globalThis as typeof globalThis & { cwDownloadSecret?: string };
const signingSecret = process.env.DOWNLOAD_SIGNING_SECRET || (signingGlobal.cwDownloadSecret ??= crypto.randomBytes(32).toString('hex'));

/**
 * Creates a cryptographically signed HMAC-SHA256 signature for a file download.
 */
export function generateDownloadSignature(jobId: string, expirationUnixMs: number): string {
  const secret = signingSecret;
  const payload = `${jobId}:${expirationUnixMs}`;
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Generates a full signed download URL for a completed job.
 */
export function generateSignedDownloadUrl(jobId: string, expirationIsoOrMs: string | number): string {
  const expirationUnixMs =
    typeof expirationIsoOrMs === 'string'
      ? new Date(expirationIsoOrMs).getTime()
      : expirationIsoOrMs;

  const signature = generateDownloadSignature(jobId, expirationUnixMs);
  return `/api/v1/jobs/${encodeURIComponent(jobId)}/download?token=${signature}&exp=${expirationUnixMs}`;
}

/**
 * Validates a signed download token and its expiration against timing attacks.
 */
export function verifySignedDownloadToken(
  jobId: string,
  token?: string | null,
  expStr?: string | null
): { valid: boolean; reason?: string } {
  // If signed URLs are disabled globally, accept
  if (!privacyConfig.signedUrls.enabled) {
    return { valid: true };
  }

  if (!token || !expStr) {
    return {
      valid: false,
      reason: 'Fehlende Signatur oder Ablaufzeit für den sicheren Download.',
    };
  }

  if (!/^\d{13}$/.test(expStr) || !/^[a-f0-9]{64}$/.test(token)) return { valid: false, reason: 'Ungueltige Signatur.' };
  const exp = Number(expStr);
  if (isNaN(exp)) {
    return { valid: false, reason: 'Ungültiges Zeitstempel-Format.' };
  }

  const now = Date.now();
  if (now > exp) {
    return {
      valid: false,
      reason: 'Der Download-Link ist abgelaufen. Die Datei wurde aus Datenschutzgründen gelöscht.',
    };
  }

  const expectedSignature = generateDownloadSignature(jobId, exp);

  try {
    const tokenBuffer = Buffer.from(token, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (tokenBuffer.length !== expectedBuffer.length) {
      return { valid: false, reason: 'Ungültige Signatur.' };
    }

    const matches = crypto.timingSafeEqual(tokenBuffer, expectedBuffer);
    if (!matches) {
      return { valid: false, reason: 'Ungültige Signatur.' };
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: 'Signaturprüfung fehlgeschlagen.' };
  }
}
