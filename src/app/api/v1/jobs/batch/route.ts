import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { storageProvider } from '@/server/storage/storage';
import { jobQueue } from '@/server/queue/queue';
import { conversionEngine } from '@/server/engine/conversion.engine';
import { ConversionJob } from '@/types/job';
import { batchConfig, getBatchLimits, validateBatchFiles } from '@/config/batch.config';
import { rateLimiter, getClientIp } from '@/server/security/rateLimiter';
import { validateUploadedFile } from '@/server/security/fileValidator';
import { privacyLog } from '@/server/utils/privacyLogger';

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-api-key');
    const isPro = Boolean(apiKey);
    const limits = getBatchLimits(isPro);

    // 0. Rate limiting check per client IP
    const ip = getClientIp(req);
    const rateLimit = rateLimiter.check(ip, 'batch', isPro);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Zu viele Stapelverarbeitungs-Anfragen. Bitte warten Sie einen Moment.',
          code: 'RATE_LIMIT_EXCEEDED',
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.resetSeconds),
            'X-RateLimit-Limit': String(rateLimit.limit),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // 1. Guard against server queue overflow
    if (!jobQueue.canAcceptJob(batchConfig.maxQueueCapacity)) {
      return NextResponse.json(
        {
          error: 'Die Server-Warteschlange ist derzeit ausgelastet. Bitte versuchen Sie es in wenigen Minuten erneut.',
          code: 'QUEUE_CAPACITY_EXCEEDED',
        },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    let files = formData.getAll('files') as File[];
    if (files.length === 0) {
      files = formData.getAll('file') as File[];
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Keine Dateien übertragen. Bitte wählen Sie mindestens eine Datei aus.' },
        { status: 400 }
      );
    }

    // 2. Enforce batch limits
    const validation = validateBatchFiles(files, isPro);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: validation.error,
          code: validation.code,
          limits: {
            maxBatchFiles: limits.maxBatchFiles,
            maxFileSizeMB: limits.maxFileSizeMB,
            maxTotalBatchMB: limits.maxTotalBatchMB,
          },
        },
        { status: validation.code === 'FILE_TOO_LARGE' || validation.code === 'BATCH_TOO_LARGE' ? 413 : 400 }
      );
    }

    const rawType = formData.get('type') as string | null;
    const targetFormat = formData.get('targetFormat') as string | null;
    const rawOptions = formData.get('options') as string | null;

    let parsedOptions: Record<string, unknown> = {};
    if (rawOptions) {
      try {
        parsedOptions = JSON.parse(rawOptions);
      } catch {}
    }
    if (targetFormat) parsedOptions.targetFormat = targetFormat;

    const batchId = `batch_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const retentionMinutes = batchConfig.retentionMinutes;
    const expiration = new Date(Date.now() + retentionMinutes * 60 * 1000).toISOString();

    const createdJobs: Array<{ id: string; filename: string; sizeBytes: number }> = [];

    // 3. Save each file and enqueue job
    for (const file of files) {
      let jobType = rawType;
      if (!jobType && targetFormat) {
        const srcExt = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();
        jobType = `office_${srcExt}_to_${targetFormat.toLowerCase().replace('.', '')}`;
      }
      if (!jobType) jobType = 'office_convert';

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Deep file validation per item in batch
      const validation = validateUploadedFile(buffer, file.name, file.type);
      if (!validation.valid) {
        return NextResponse.json(
          {
            error: `Fehler bei Datei "${file.name}": ${validation.error}`,
            code: validation.code || 'INVALID_BATCH_FILE',
          },
          { status: 400 }
        );
      }

      const safeFilename = validation.safeFilename;
      const saved = await storageProvider.saveInput(buffer, safeFilename);

      const jobId = `job_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const newJob: ConversionJob = {
        id: jobId,
        type: jobType,
        status: 'queued',
        input: {
          originalName: safeFilename,
          mimeType: file.type || 'application/octet-stream',
          sizeBytes: saved.sizeBytes,
          storagePath: saved.storagePath,
        },
        progress: 0,
        options: {
          ...parsedOptions,
          batchId,
          isPro,
        },
        createdAt: new Date().toISOString(),
        expiration,
      };

      await jobQueue.enqueue(newJob);
      createdJobs.push({
        id: newJob.id,
        filename: safeFilename,
        sizeBytes: saved.sizeBytes,
      });
    }

    // 4. Trigger concurrent worker pool asynchronously
    setTimeout(() => {
      conversionEngine.triggerWorker().catch((err) => {
        privacyLog('error', '[Batch Worker Error]', { error: (err as Error).message });
      });
    }, 10);

    return NextResponse.json(
      {
        batchId,
        totalJobs: createdJobs.length,
        jobs: createdJobs,
        isPro,
        expiration,
        message: `${createdJobs.length} Datei(en) erfolgreich zur Stapelverarbeitung eingereiht.`,
      },
      { status: 202 }
    );
  } catch (err: unknown) {
    privacyLog('error', '[Batch API Error]', { error: (err as Error).message });
    return NextResponse.json(
      { error: 'Interner Serverfehler bei der Stapelverarbeitung.' },
      { status: 500 }
    );
  }
}
