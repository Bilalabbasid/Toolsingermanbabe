/**
 * Centralized Environment & Infrastructure Configuration
 * 
 * Safely parses and typed-checks environment variables across development,
 * testing, and production environments without leaking server-only secrets.
 */

export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const IS_TEST = process.env.NODE_ENV === 'test';

// Public Browser-Safe Configuration
export const PUBLIC_CONFIG = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://coolwave.cool',
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  adsEnabled: process.env.NEXT_PUBLIC_ENABLE_ADS === 'true',
  adsenseClientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || '',
};

// Database Configuration
export const DATABASE_CONFIG = {
  url: process.env.DATABASE_URL || '',
  isConfigured: Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0),
  isAzure: Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.includes('postgres.database.azure.com')),
};

// Authentication & Session Security
export const AUTH_CONFIG = {
  secret: process.env.AUTH_SECRET || 'dev-secret-change-in-production',
  adminSecret: process.env.ADMIN_SECRET || '',
  initialAdminEmail: process.env.ADMIN_INITIAL_EMAIL || '',
  initialAdminPassword: process.env.ADMIN_INITIAL_PASSWORD || '',
};

// Stripe Billing Configuration
export const STRIPE_CONFIG = {
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  proPriceId: process.env.STRIPE_PRO_PRICE_ID || '',
  isConfigured: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.trim().length > 0),
};

// Cloud Object Storage (R2 / S3) Configuration
export const STORAGE_CONFIG = {
  endpoint: process.env.R2_ENDPOINT || '',
  accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  bucket: process.env.R2_BUCKET || '',
  isR2Configured: Boolean(
    process.env.R2_ENDPOINT &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET
  ),
};

// Runtime Operational Limits & Retention
export const LIMITS_CONFIG = {
  tempRetentionMinutes: Number(process.env.TEMP_FILE_RETENTION_MINUTES || '15'),
  processingTimeoutMs: Number(process.env.PROCESSING_TIMEOUT_MS || '60000'),
  ocrTimeoutMs: Number(process.env.OCR_TIMEOUT_MS || '120000'),
  maxFileSizeFreeMB: Number(process.env.MAX_FILE_SIZE_FREE || '50'),
  maxFileSizeProMB: Number(process.env.MAX_FILE_SIZE_PRO || '500'),
};
