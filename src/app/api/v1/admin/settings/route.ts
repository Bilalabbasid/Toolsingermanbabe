import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/server/auth/guards';
import { getAllSettings, updateSetting } from '@/server/admin/settings.service';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const settings = await getAllSettings();
    return NextResponse.json({ settings });
  } catch (err: any) {
    const status = err.statusCode || 401;
    return NextResponse.json({ error: err.message || 'Nicht autorisiert' }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    const body = await req.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json({ error: 'Parameter "key" ist erforderlich.' }, { status: 400 });
    }

    const updated = await updateSetting(key, value, admin.id);
    return NextResponse.json({ success: true, setting: updated });
  } catch (err: any) {
    const status = err.statusCode || 500;
    return NextResponse.json({ error: err.message || 'Fehler beim Aktualisieren der Einstellungen' }, { status });
  }
}
