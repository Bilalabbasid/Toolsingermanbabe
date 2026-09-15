import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/server/auth/guards';
import { listToolConfigurations, updateToolConfiguration } from '@/server/admin/toolConfig.service';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const tools = await listToolConfigurations();
    return NextResponse.json({ tools, total: tools.length });
  } catch (err: any) {
    const status = err.statusCode || 401;
    return NextResponse.json({ error: err.message || 'Nicht autorisiert' }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    const body = await req.json();
    const { toolSlug, updates } = body;

    if (!toolSlug || !updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'Ungültige Parameter: toolSlug und updates erforderlich.' }, { status: 400 });
    }

    const updated = await updateToolConfiguration(toolSlug, updates, admin.id);
    return NextResponse.json({ success: true, toolSlug, config: updated });
  } catch (err: any) {
    const status = err.statusCode || 500;
    return NextResponse.json({ error: err.message || 'Fehler beim Aktualisieren der Tool-Konfiguration' }, { status });
  }
}
