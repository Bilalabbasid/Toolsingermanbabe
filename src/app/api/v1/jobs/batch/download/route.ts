import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { jobQueue } from '@/server/queue/queue';
import { storageProvider } from '@/server/storage/storage';
import { boundedBody, ownsJob, requestError, RequestError } from '@/server/security/request';
import { rateLimiter, getClientIp } from '@/server/security/rateLimiter';
import { sanitizeFilename } from '@/server/security/fileValidator';

export async function POST(req: NextRequest) {
  try {
    const rate = rateLimiter.check(getClientIp(req), 'download');
    if (!rate.allowed) return NextResponse.json({ code: 'RATE_LIMIT_EXCEEDED' }, { status: 429, headers: { 'Retry-After': String(rate.resetSeconds) } });
    let body;
    try { body = JSON.parse(Buffer.from(await boundedBody(req, 16384)).toString('utf8')); }
    catch (err) { throw err instanceof RequestError ? err : new RequestError('INVALID_JSON'); }
    const jobIds: string[] = body.jobIds || [];

    if (!Array.isArray(jobIds) || jobIds.length === 0 || jobIds.length > 50 || jobIds.some(id => typeof id !== 'string')) {
      return NextResponse.json(
        { error: 'Keine Auftrags-IDs übergeben (jobIds erforderlich).' },
        { status: 400 }
      );
    }

    const zip = new JSZip();
    let fileCount = 0;
    let totalBytes = 0;
    const names = new Set<string>();

    for (const id of jobIds) {
      const job = await jobQueue.getJob(id);
      if (!job || !ownsJob(req, job)) return NextResponse.json({ error: 'Auftrag nicht gefunden.' }, { status: 404 });
      if (!job || job.status !== 'completed' || !job.output) {
        continue;
      }

      // Check expiration
      if (new Date(job.expiration).getTime() < Date.now()) {
        continue;
      }

      try {
        totalBytes += (await storageProvider.getFileStats(job.output.storagePath)).sizeBytes;
        if (totalBytes > 150 * 1024 * 1024) throw new RequestError('BATCH_TOO_LARGE', 413);
        const fileBuffer = await storageProvider.read(job.output.storagePath);
        let filename = sanitizeFilename(job.output.fileName);
        if (names.has(filename)) filename = `${fileCount + 1}_${filename}`;
        names.add(filename);
        zip.file(filename, fileBuffer);
        fileCount++;
      } catch (err) {
        if (err instanceof RequestError) throw err;
        console.error(`[Batch Zip] Failed to read job ${id} output:`, err);
      }
    }

    if (fileCount === 0) {
      return NextResponse.json(
        { error: 'Keine fertigen Dateien zum Herunterladen gefunden oder Dateien sind abgelaufen.' },
        { status: 404 }
      );
    }

    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    const zipFilename = `coolwave_stapel_${Date.now()}.zip`;

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(zipFilename)}"`,
        'Content-Length': zipBuffer.length.toString(),
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err) {
    if (err instanceof RequestError) return requestError(err);
    console.error('[Batch Zip Error]:', err);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des ZIP-Archivs.' },
      { status: 500 }
    );
  }
}
