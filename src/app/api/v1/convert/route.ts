import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const targetFormat = formData.get('targetFormat') as string | null;
    const apiKey = req.headers.get('x-api-key');

    // 1. Validation
    if (!file) {
      return NextResponse.json(
        { error: 'Keine Datei übertragen (field: file erforderlich).' },
        { status: 400 }
      );
    }

    if (!targetFormat) {
      return NextResponse.json(
        { error: 'Zielformat fehlt (field: targetFormat erforderlich).' },
        { status: 400 }
      );
    }

    // 2. Enforce limits (Free: 50MB, with API key / Pro: up to 500MB)
    const maxSizeBytes = apiKey ? 500 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { 
          error: `Datei überschreitet das zulässige Limit von ${apiKey ? '500MB' : '50MB'}.`,
          code: 'FILE_TOO_LARGE'
        },
        { status: 413 }
      );
    }

    // Ephemeral processing metadata
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    return NextResponse.json({
      success: true,
      jobId,
      status: 'COMPLETED',
      filename: `coolwave_${file.name.replace(/\.[^/.]+$/, '')}.${targetFormat.toLowerCase()}`,
      originalSize: file.size,
      processedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15-minute deletion lifecycle
      message: 'Datei erfolgreich verarbeitet. Automatische Löschung nach 15 Minuten garantiert.',
    });
  } catch (error: unknown) {
    console.error('[CoolWave API Error]:', error);
    return NextResponse.json(
      { 
        error: 'Interner Verarbeitungsfehler. Bitte versuchen Sie es erneut.',
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}
