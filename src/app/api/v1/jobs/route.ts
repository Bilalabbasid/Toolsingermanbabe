import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { storageProvider } from '@/server/storage/storage';
import { jobQueue } from '@/server/queue/queue';
import { conversionEngine } from '@/server/engine/conversion.engine';
import { ConversionJob } from '@/types/job';

export async function POST(req: NextRequest) {
  try {
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
    const apiKey = req.headers.get('x-api-key');

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

    // 1. Validate file
    if (!file) {
      return NextResponse.json(
        { error: 'Keine Datei übertragen. Bitte wählen Sie eine Datei aus.' },
        { status: 400 }
      );
    }

    // 2. Validate file size limits
    const maxFreeMB = parseInt(process.env.MAX_FILE_SIZE_FREE || '50', 10);
    const maxProMB = parseInt(process.env.MAX_FILE_SIZE_PRO || '500', 10);
    const allowedMaxBytes = (apiKey ? maxProMB : maxFreeMB) * 1024 * 1024;

    if (file.size > allowedMaxBytes) {
      return NextResponse.json(
        {
          error: `Die Datei überschreitet das Limit von ${apiKey ? maxProMB : maxFreeMB} MB.`,
          code: 'FILE_TOO_LARGE',
        },
        { status: 413 }
      );
    }

    // 3. Store input in ephemeral storage
    const arrayBuffer = await file.arrayBuffer();
    const saved = await storageProvider.saveInput(arrayBuffer, file.name);

    // 4. Calculate retention expiration (default 15 mins)
    const retentionMinutes = parseInt(process.env.TEMP_FILE_RETENTION_MINUTES || '15', 10);
    const expiration = new Date(Date.now() + retentionMinutes * 60 * 1000).toISOString();

    // 5. Create Job Record
    const jobId = `job_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const newJob: ConversionJob = {
      id: jobId,
      type: jobType,
      status: 'queued',
      input: {
        originalName: file.name,
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

    // 6. Trigger decoupled worker asynchronously (non-blocking)
    setTimeout(() => {
      conversionEngine.triggerWorker().catch((err) => {
        console.error('[Worker Error]:', err);
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
  } catch (err) {
    console.error('[Jobs API Error]:', err);
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
