import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';
import { jobQueue } from '@/server/queue/queue';
import { storageProvider } from '@/server/storage/storage';
import { verifySignedDownloadToken } from '@/server/security/signedUrl';
import { privacyConfig } from '@/config/privacy.config';
import { getInfrastructureConfig } from '@/config/infrastructure.config';
import { analyticsService } from '@/server/analytics/analytics.service';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const token = req.nextUrl.searchParams.get('token');
  const exp = req.nextUrl.searchParams.get('exp');

  // Verify signed download token if provided or if enforced
  if (token || exp || privacyConfig.signedUrls.enabled) {
    // If a token is provided, verify it strictly
    if (token || exp) {
      const verification = verifySignedDownloadToken(id, token, exp);
      if (!verification.valid) {
        return NextResponse.json(
          { error: verification.reason || 'Ungültige oder abgelaufene Download-Signatur.' },
          { status: 403 }
        );
      }
    }
  }

  const job = await jobQueue.getJob(id);

  if (!job) {
    return NextResponse.json(
      { error: 'Auftrag nicht gefunden oder abgelaufen.' },
      { status: 404 }
    );
  }

  if (job.status !== 'completed' || !job.output) {
    return NextResponse.json(
      { error: `Datei steht noch nicht zum Download bereit (Status: ${job.status}).` },
      { status: 400 }
    );
  }

  if (new Date(job.expiration).getTime() < Date.now()) {
    return NextResponse.json(
      { error: 'Die temporäre Datei ist abgelaufen und wurde aus Datenschutzgründen gelöscht.' },
      { status: 410 }
    );
  }

  try {
    const infraConfig = getInfrastructureConfig();
    const { stream: nodeStream, sizeBytes } = await storageProvider.createReadStream(
      job.output.storagePath,
      infraConfig.storage.streamChunkSizeBytes
    );

    // Track download_completed
    analyticsService.track({
      eventType: 'download_completed',
      toolSlug: job.type,
      outputSizeBytes: sizeBytes,
    }).catch(() => {});

    // Hook auto-cleanup when stream transmission completes or closes
    const autoCleanRequested = req.nextUrl.searchParams.get('autoclean') === 'true';
    if (infraConfig.storage.deleteOnDownload || autoCleanRequested) {
      (nodeStream as any).on('close', async () => {
        try {
          await storageProvider.delete(job.output!.storagePath);
          await jobQueue.updateJob(job.id, {
            status: 'expired',
            error: 'Datei nach erfolgreichem Download automatisch aus dem Speicher entfernt.',
          });
        } catch {
          // Cleanup best-effort
        }
      });
    }

    // Convert Node.js stream to Web ReadableStream for zero-copy transmission
    const webStream = Readable.toWeb(nodeStream as Readable);

    return new Response(webStream as any, {
      status: 200,
      headers: {
        'Content-Type': job.output.mimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(job.output.fileName)}"`,
        'Content-Length': sizeBytes.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
      },
    });
  } catch (err) {
    console.error('[Download Error]:', err);
    return NextResponse.json(
      { error: 'Die konvertierte Datei konnte nicht vom Speicher geladen werden.' },
      { status: 500 }
    );
  }
}
