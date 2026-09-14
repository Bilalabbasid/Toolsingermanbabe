/**
 * CoolWave Technical Privacy Architecture Configuration
 * Adheres to German (DDG, TDDDG) and European (DSGVO / GDPR) privacy standards.
 */

export interface PrivacyConfig {
  /** Retention duration in minutes for temporary files on server (default: 15 min) */
  retentionMinutes: number;
  /** Immediately delete uploaded input files once conversion/processing succeeds */
  deleteInputImmediatelyOnSuccess: boolean;
  /** Cryptographically signed time-limited download URLs */
  signedUrls: {
    enabled: boolean;
    secret: string;
    ttlSeconds: number;
  };
  /** Whether to anonymize client IP addresses before logging */
  anonymizeIp: boolean;
  /** Periodic cleanup interval in minutes */
  cleanupIntervalMinutes: number;
}

const retentionMinutes = parseInt(process.env.TEMP_FILE_RETENTION_MINUTES || '15', 10);

export const privacyConfig: PrivacyConfig = {
  retentionMinutes,
  deleteInputImmediatelyOnSuccess: true,
  signedUrls: {
    enabled: true,
    secret: process.env.DOWNLOAD_SIGNING_SECRET || 'coolwave_ephemeral_signing_secret_key_prod_fallback',
    ttlSeconds: retentionMinutes * 60,
  },
  anonymizeIp: true,
  cleanupIntervalMinutes: 5,
};
