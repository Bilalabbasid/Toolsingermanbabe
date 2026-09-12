import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'CoolWave API Engine',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    capabilities: {
      inBrowserExecution: true,
      serverFallback: true,
      supportedCategories: ['pdf', 'images', 'documents', 'utilities', 'security', 'ocr'],
    },
  });
}
