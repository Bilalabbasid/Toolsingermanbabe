import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { storageProvider } from '@/server/storage/storage';
import { jobQueue } from '@/server/queue/queue';
import { conversionEngine } from '@/server/engine/conversion.engine';
import { ConversionJob } from '@/types/job';
import { rateLimiter, getClientIp } from '@/server/security/rateLimiter';
import { validateUploadedFile } from '@/server/security/fileValidator';
import { privacyLog } from '@/server/utils/privacyLogger';

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-api-key');
    const isPro = !!apiKey;

    // 0. Rate limiting check per client IP
    const ip = getClientIp(req);
    const rateLimit = rateLimiter.check(ip, 'job', isPro);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Zu viele Anfragen. Bitte warten Sie einen Moment vor dem nächsten Upload.', code: 'RATE_LIMIT_EXCEEDED' },
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

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const rawType = formData.get('type') as string | null;
    const targetFormat = formData.get('targetFormat') as string | null;
    let jobType = rawType;
    if (!jobType && file && targetFormat) {
      const srcExt = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();
      jobType = `office_${srcExt}_to_${targetFormat.toLowerCase().replace('.', '')}`;
    }
    if (!jobType) jobType = 'office_convert';

    const language = formData.get('language') as string | null;
    const outputType = formData.get('outputType') as 'pdf' | 'docx' | 'txt' | null;
    const rawOptions = formData.get('options') as string | null;
    let parsedOptions: Record<string, unknown> = {};
    if (rawOptions) {
      try {
        parsedOptions = JSON.parse(rawOptions);
      } catch {
        // Ignore JSON parse error
      }
    }
    if (language) parsedOptions.language = language;
    if (outputType) parsedOptions.outputType = outputType;
    if (targetFormat) parsedOptions.targetFormat = targetFormat;

    // 1. Validate file presence
    if (!file) {
      return NextResponse.json(
        { error: 'Keine Datei übertragen. Bitte wählen Sie eine Datei aus.' },
        { status: 400 }
      );
    }

    // 2. Validate file size limits
    const maxFreeMB = parseInt(process.env.MAX_FILE_SIZE_FREE || '50', 10);
    const maxProMB = parseInt(process.env.MAX_FILE_SIZE_PRO || '500', 10);
    const allowedMaxBytes = (isPro ? maxProMB : maxFreeMB) * 1024 * 1024;

    if (file.size > allowedMaxBytes) {
      return NextResponse.json(
        {
          error: `Die Datei überschreitet das Limit von ${isPro ? maxProMB : maxFreeMB} MB.`,
          code: 'FILE_TOO_LARGE',
        },
        { status: 413 }
      );
    }

    // 3. Deep File Validation & Magic-Byte Anti-Spoofing
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const validation = validateUploadedFile(buffer, file.name, file.type);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: validation.error || 'Ungültige oder potenziell schädliche Datei.',
          code: validation.code || 'INVALID_FILE',
        },
        { status: 400 }
      );
    }

    const safeOriginalName = validation.safeFilename;

    // 4. Store input in isolated ephemeral storage
    const saved = await storageProvider.saveInput(buffer, safeOriginalName);

    // 5. Calculate retention expiration
    const retentionMinutes = parseInt(process.env.TEMP_FILE_RETENTION_MINUTES || '15', 10);
    const expiration = new Date(Date.now() + retentionMinutes * 60 * 1000).toISOString();

    // 6. Create Job Record
    const jobId = `job_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const newJob: ConversionJob = {
      id: jobId,
      type: jobType,
      status: 'queued',
      input: {
        originalName: safeOriginalName,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: saved.sizeBytes,
        storagePath: saved.storagePath,
      },
      progress: 0,
      options: parsedOptions,
      createdAt: new Date().toISOString(),
      expiration,
    };

    await jobQueue.enqueue(newJob);

    // 7. Trigger decoupled worker asynchronously (non-blocking)
    setTimeout(() => {
      conversionEngine.triggerWorker().catch((err) => {
        privacyLog('error', '[Worker Error]', { error: (err as Error).message });
      });
    }, 10);

    return NextResponse.json(
      {
        jobId: newJob.id,
        status: newJob.status,
        type: newJob.type,
        expiration: newJob.expiration,
        message: 'Konvertierungsauftrag erfolgreich in die Warteschlange eingereiht.',
      },
      { status: 202 }
    );
  } catch (err: unknown) {
    privacyLog('error', '[Jobs API Error]', { error: (err as Error).message });
    return NextResponse.json(
      { error: 'Interner Verarbeitungsfehler beim Einreihen des Auftrags.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const jobs = await jobQueue.listJobs();
    return NextResponse.json({
      total: jobs.length,
      jobs: jobs.map((j) => ({
        id: j.id,
        type: j.type,
        status: j.status,
        progress: j.progress,
        createdAt: j.createdAt,
        completedAt: j.completedAt,
        error: j.error,
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Fehler beim Abrufen der Aufträge.' }, { status: 500 });
  }
}
