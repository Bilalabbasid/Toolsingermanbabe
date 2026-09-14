import { NextRequest, NextResponse } from 'next/server';
import { jobQueue } from '@/server/queue/queue';
import { storageProvider } from '@/server/storage/storage';
import { verifySignedDownloadToken } from '@/server/security/signedUrl';
import { privacyConfig } from '@/config/privacy.config';
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
    const fileBuffer = await storageProvider.read(job.output.storagePath);

    // Track download_completed
    analyticsService.track({
      eventType: 'download_completed',
      toolSlug: job.type,
      outputSizeBytes: fileBuffer.length,
    }).catch(() => {});

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': job.output.mimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(job.output.fileName)}"`,
        'Content-Length': fileBuffer.length.toString(),
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
