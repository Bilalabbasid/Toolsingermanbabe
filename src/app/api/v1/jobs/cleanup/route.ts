import { isAdminRequest } from '@/server/security/request';
import { NextRequest, NextResponse } from 'next/server';
import { storageProvider } from '@/server/storage/storage';
import { jobQueue } from '@/server/queue/queue';

async function handleCleanup(req: NextRequest) {
  try {
    if (!(await isAdminRequest(req, process.env.CRON_SECRET))) return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 401 });

    const retentionMinutes = parseInt(process.env.TEMP_FILE_RETENTION_MINUTES || '15', 10);
    const cleanedFiles = await storageProvider.cleanupExpired(retentionMinutes);
    const cleanedJobs = await jobQueue.cleanupExpired();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      cleanedFiles,
      cleanedJobs,
      message: `Bereinigung erfolgreich durchgeführt (${cleanedFiles} Dateien, ${cleanedJobs} abgelaufene Aufträge entfernt).`,
    });
  } catch (err) {
    console.error('[Cleanup Error]:', err);
    return NextResponse.json({ error: 'Fehler bei der automatischen Bereinigung.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return handleCleanup(req);
}

export async function POST(req: NextRequest) {
  return handleCleanup(req);
}
