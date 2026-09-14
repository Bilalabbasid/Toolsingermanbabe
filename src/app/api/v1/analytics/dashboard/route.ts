import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/server/analytics/analytics.service';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const rangeParam = searchParams.get('range') as 'today' | '7d' | '30d' | 'all' | null;
    const range = rangeParam || 'all';

    const data = await analyticsService.getDashboardMetrics(range);
    return NextResponse.json(data);
  } catch (err) {
    console.error('[Analytics Dashboard API Error]', err);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Analytics-Dashboard-Daten.' },
      { status: 500 }
    );
  }
}
