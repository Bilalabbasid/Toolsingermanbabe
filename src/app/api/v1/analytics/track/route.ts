import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/server/analytics/analytics.service';
import { AnalyticsEventType } from '@/types/analytics';

const VALID_EVENT_TYPES: Set<AnalyticsEventType> = new Set([
  'tool_view',
  'upload_started',
  'upload_completed',
  'conversion_started',
  'conversion_completed',
  'conversion_failed',
  'download_completed',
  'pro_viewed',
  'pro_clicked',
  'signup_started',
  'signup_completed',
]);

export async function POST(req: NextRequest) {
  try {
    let body: any;
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      body = await req.json();
    } else {
      // Beacon sends text/plain sometimes
      const text = await req.text();
      body = text ? JSON.parse(text) : {};
    }

    const { eventType, toolSlug, category, fileSizeBytes, outputSizeBytes, durationMs, referrerSlug, planId, interval, triggerReason } = body;

    if (!eventType || !VALID_EVENT_TYPES.has(eventType)) {
      return NextResponse.json({ error: 'Ungültiger oder fehlender Event-Typ.' }, { status: 400 });
    }

    // Strict privacy sanitization: Only pass safe operational metadata
    await analyticsService.track({
      eventType,
      toolSlug: typeof toolSlug === 'string' ? toolSlug.slice(0, 80) : undefined,
      category: typeof category === 'string' ? category.slice(0, 50) : undefined,
      fileSizeBytes: typeof fileSizeBytes === 'number' ? Math.max(0, fileSizeBytes) : undefined,
      outputSizeBytes: typeof outputSizeBytes === 'number' ? Math.max(0, outputSizeBytes) : undefined,
      durationMs: typeof durationMs === 'number' ? Math.max(0, durationMs) : undefined,
      referrerSlug: typeof referrerSlug === 'string' ? referrerSlug.slice(0, 80) : undefined,
      planId: typeof planId === 'string' ? planId.slice(0, 40) : undefined,
      interval: interval === 'monthly' || interval === 'yearly' ? interval : undefined,
      triggerReason: typeof triggerReason === 'string' ? triggerReason.slice(0, 120) : undefined,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Fehler beim Aufzeichnen des Events.' }, { status: 500 });
  }
}
