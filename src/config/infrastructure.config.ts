/**
 * CoolWave Infrastructure Economics Configuration
 * Defines environment-specific profiles to minimize cost per conversion
 * and protect host hardware from CPU/RAM starvation.
 */

export type AppEnvironment = 'development' | 'staging' | 'production';

export interface ConcurrencyLimits {
  /** General worker pool concurrency (PDF, text, light image) */
  general: number;
  /** Heavy media worker concurrency (FFmpeg audio/video) */
  media: number;
  /** Heavy OCR worker concurrency (Tesseract multi-page recognition) */
  ocr: number;
  /** Max jobs held in waiting queue before 503 rejection */
  maxQueueCapacity: number;
}

export interface ProcessingTimeouts {
  /** Standard conversion timeout (in milliseconds) */
  generalMs: number;
  /** OCR processing timeout (in milliseconds) */
  ocrMs: number;
  /** Video/audio transcode timeout (in milliseconds) */
  mediaMs: number;
}

export interface StorageEconomicsConfig {
  /** Retention duration in minutes for temporary files */
  retentionMinutes: number;
  /** Periodic cleanup interval in minutes */
  cleanupIntervalMinutes: number;
  /** Immediately delete uploaded input files upon conversion success or failure */
  purgeInputImmediately: boolean;
  /** Automatically schedule or execute file deletion after user download */
  deleteOnDownload: boolean;
  /** Streaming buffer chunk size in bytes (default 64KB for optimal throughput and minimal RAM) */
  streamChunkSizeBytes: number;
}

export interface EnvironmentProfile {
  name: AppEnvironment;
  concurrency: ConcurrencyLimits;
  timeouts: ProcessingTimeouts;
  storage: StorageEconomicsConfig;
  caching: {
    /** Whether to cache initialized Tesseract OCR workers */
    poolOcrWorkers: boolean;
    /** Max idle time for pooled OCR worker in milliseconds before disposal */
    ocrWorkerIdleTimeoutMs: number;
  };
}

const profiles: Record<AppEnvironment, EnvironmentProfile> = {
  development: {
    name: 'development',
    concurrency: {
      general: 2,
      media: 1,
      ocr: 1,
      maxQueueCapacity: 50,
    },
    timeouts: {
      generalMs: 45_000,
      ocrMs: 90_000,
      mediaMs: 120_000,
    },
    storage: {
      retentionMinutes: 10,
      cleanupIntervalMinutes: 5,
      purgeInputImmediately: true,
      deleteOnDownload: false, // Keep for testing repeated manual downloads in dev
      streamChunkSizeBytes: 64 * 1024, // 64 KB
    },
    caching: {
      poolOcrWorkers: true,
      ocrWorkerIdleTimeoutMs: 120_000, // 2 minutes
    },
  },
  staging: {
    name: 'staging',
    concurrency: {
      general: 4,
      media: 2,
      ocr: 2,
      maxQueueCapacity: 100,
    },
    timeouts: {
      generalMs: 60_000,
      ocrMs: 120_000,
      mediaMs: 180_000,
    },
    storage: {
      retentionMinutes: 15,
      cleanupIntervalMinutes: 5,
      purgeInputImmediately: true,
      deleteOnDownload: true,
      streamChunkSizeBytes: 64 * 1024,
    },
    caching: {
      poolOcrWorkers: true,
      ocrWorkerIdleTimeoutMs: 300_000, // 5 minutes
    },
  },
  production: {
    name: 'production',
    concurrency: {
      general: Math.max(2, parseInt(process.env.SERVER_CONCURRENCY || '6', 10)),
      media: Math.max(1, parseInt(process.env.MAX_MEDIA_CONCURRENCY || '2', 10)),
      ocr: Math.max(1, parseInt(process.env.MAX_OCR_CONCURRENCY || '2', 10)),
      maxQueueCapacity: Math.max(50, parseInt(process.env.MAX_QUEUE_CAPACITY || '200', 10)),
    },
    timeouts: {
      generalMs: parseInt(process.env.PROCESSING_TIMEOUT_MS || '60000', 10),
      ocrMs: parseInt(process.env.OCR_TIMEOUT_MS || '120000', 10),
      mediaMs: parseInt(process.env.MEDIA_TIMEOUT_MS || '180000', 10),
    },
    storage: {
      retentionMinutes: parseInt(process.env.TEMP_FILE_RETENTION_MINUTES || '10', 10),
      cleanupIntervalMinutes: parseInt(process.env.CLEANUP_INTERVAL_MINUTES || '3', 10),
      purgeInputImmediately: true,
      deleteOnDownload: process.env.AUTO_DELETE_ON_DOWNLOAD !== 'false', // Default true: delete from Azure immediately after download
      streamChunkSizeBytes: 64 * 1024, // 64 KB
    },
    caching: {
      poolOcrWorkers: true,
      ocrWorkerIdleTimeoutMs: 600_000, // 10 minutes
    },
  },
};

export function getCurrentEnvironment(): AppEnvironment {
  const env = (process.env.APP_ENV || process.env.NODE_ENV || 'development').toLowerCase();
  if (env === 'production' || env === 'prod') return 'production';
  if (env === 'staging' || env === 'stage') return 'staging';
  return 'development';
}

export function getInfrastructureConfig(): EnvironmentProfile {
  const currentEnv = getCurrentEnvironment();
  return profiles[currentEnv];
}
