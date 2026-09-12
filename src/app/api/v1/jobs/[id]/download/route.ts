import { NextRequest, NextResponse } from 'next/server';
import { jobQueue } from '@/server/queue/queue';
import { storageProvider } from '@/server/storage/storage';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
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

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': job.output.mimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(job.output.fileName)}"`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'no-store, max-age=0',
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
