import { NextRequest, NextResponse } from 'next/server';
import { jobQueue } from '@/server/queue/queue';
import { ownsJob } from '@/server/security/request';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const job = await jobQueue.getJob(id);

  if (!job || !ownsJob(req, job)) {
    return NextResponse.json(
      { error: `Auftrag mit ID „${id}“ wurde nicht gefunden oder ist bereits abgelaufen.` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: job.id,
    type: job.type,
    status: job.status,
    progress: job.progress,
    createdAt: job.createdAt,
    startedAt: job.startedAt,
    completedAt: job.completedAt,
    error: job.error,
    expiration: job.expiration,
    output: job.status === 'completed' && job.output
      ? {
          fileName: job.output.fileName,
          sizeBytes: job.output.sizeBytes,
          downloadUrl: job.output.downloadUrl,
        }
      : undefined,
  }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const job = await jobQueue.getJob(id);
  if (!job || !ownsJob(req, job)) return NextResponse.json({ error: 'Auftrag nicht gefunden.' }, { status: 404 });
  const success = await jobQueue.cancelJob(id);

  if (!success) {
    return NextResponse.json(
      { error: 'Auftrag konnte nicht abgebrochen werden (nicht gefunden oder bereits beendet).' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    message: `Auftrag „${id}“ wurde erfolgreich abgebrochen.`,
  });
}
