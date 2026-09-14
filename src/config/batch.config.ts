export interface BatchTierLimits {
  maxBatchFiles: number;
  maxFileSizeMB: number;
  maxTotalBatchMB: number;
  clientConcurrency: number;
  serverConcurrency: number;
}

export interface BatchSystemConfig {
  free: BatchTierLimits;
  pro: BatchTierLimits;
  maxQueueCapacity: number;
  retentionMinutes: number;
}

export const batchConfig: BatchSystemConfig = {
  free: {
    maxBatchFiles: parseInt(process.env.MAX_BATCH_FREE || '5', 10),
    maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_FREE || '50', 10),
    maxTotalBatchMB: parseInt(process.env.MAX_BATCH_SIZE_FREE || '150', 10),
    clientConcurrency: parseInt(process.env.CLIENT_CONCURRENCY_FREE || '2', 10),
    serverConcurrency: parseInt(process.env.SERVER_CONCURRENCY_FREE || '2', 10),
  },
  pro: {
    maxBatchFiles: parseInt(process.env.MAX_BATCH_PRO || '50', 10),
    maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_PRO || '500', 10),
    maxTotalBatchMB: parseInt(process.env.MAX_BATCH_SIZE_PRO || '2000', 10),
    clientConcurrency: parseInt(process.env.CLIENT_CONCURRENCY_PRO || '6', 10),
    serverConcurrency: parseInt(process.env.SERVER_CONCURRENCY_PRO || '8', 10),
  },
  maxQueueCapacity: parseInt(process.env.MAX_QUEUE_CAPACITY || '100', 10),
  retentionMinutes: parseInt(process.env.TEMP_FILE_RETENTION_MINUTES || '15', 10),
};

export function getBatchLimits(isPro: boolean): BatchTierLimits {
  return isPro ? batchConfig.pro : batchConfig.free;
}

export interface BatchValidationResult {
  valid: boolean;
  error?: string;
  code?: 'TOO_MANY_FILES' | 'FILE_TOO_LARGE' | 'BATCH_TOO_LARGE';
  totalBytes: number;
}

export function validateBatchFiles(files: File[] | { name: string; size: number }[], isPro: boolean): BatchValidationResult {
  const limits = getBatchLimits(isPro);
  const tierName = isPro ? 'Pro' : 'Kostenlos';

  if (files.length === 0) {
    return { valid: false, error: 'Keine Dateien ausgewählt.', totalBytes: 0 };
  }

  // 1. Check file count limit
  if (files.length > limits.maxBatchFiles) {
    return {
      valid: false,
      code: 'TOO_MANY_FILES',
      error: `Zu viele Dateien ausgewählt (${files.length}). Das Limit für ${tierName}-Nutzer beträgt maximal ${limits.maxBatchFiles} Dateien pro Durchgang.`,
      totalBytes: 0,
    };
  }

  // 2. Check individual file sizes & total batch size
  let totalBytes = 0;
  const maxSingleBytes = limits.maxFileSizeMB * 1024 * 1024;
  const maxTotalBytes = limits.maxTotalBatchMB * 1024 * 1024;

  for (const f of files) {
    if (f.size > maxSingleBytes) {
      return {
        valid: false,
        code: 'FILE_TOO_LARGE',
        error: `Die Datei „${f.name}“ ist zu groß (${(f.size / (1024 * 1024)).toFixed(1)} MB). Erlaubt sind max. ${limits.maxFileSizeMB} MB (${tierName}).`,
        totalBytes,
      };
    }
    totalBytes += f.size;
  }

  if (totalBytes > maxTotalBytes) {
    return {
      valid: false,
      code: 'BATCH_TOO_LARGE',
      error: `Das Gesamtvolumen des Stapels beträgt ${(totalBytes / (1024 * 1024)).toFixed(1)} MB. Das Limit für ${tierName}-Nutzer liegt bei max. ${limits.maxTotalBatchMB} MB.`,
      totalBytes,
    };
  }

  return { valid: true, totalBytes };
}
