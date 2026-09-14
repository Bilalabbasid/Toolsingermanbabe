import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { jobQueue } from '@/server/queue/queue';
import { storageProvider } from '@/server/storage/storage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const jobIds: string[] = body.jobIds || [];

    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      return NextResponse.json(
        { error: 'Keine Auftrags-IDs übergeben (jobIds erforderlich).' },
        { status: 400 }
      );
    }

    const zip = new JSZip();
    let fileCount = 0;

    for (const id of jobIds) {
      const job = await jobQueue.getJob(id);
      if (!job || job.status !== 'completed' || !job.output) {
        continue;
      }

      // Check expiration
      if (new Date(job.expiration).getTime() < Date.now()) {
        continue;
      }

      try {
        const fileBuffer = await storageProvider.read(job.output.storagePath);
        zip.file(job.output.fileName, fileBuffer);
        fileCount++;
      } catch (err) {
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
    console.error('[Batch Zip Error]:', err);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des ZIP-Archivs.' },
      { status: 500 }
    );
  }
}
