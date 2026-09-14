import { NextResponse } from 'next/server';
export async function POST() {
  return NextResponse.json({ error: 'Abonnements sind derzeit nicht verfuegbar.', code: 'BILLING_UNAVAILABLE' }, { status: 503 });
}
