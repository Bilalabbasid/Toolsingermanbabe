import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/server/auth/guards';
import { prisma, isDatabaseConfigured } from '@/server/db/prisma';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    if (!isDatabaseConfigured()) {
      return NextResponse.json({
        auditLogs: [],
        total: 0,
        message: 'Datenbank ist nicht verbunden. Audit-Logs im Fallback-Modus nicht verfügbar.',
      });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);
    const action = searchParams.get('action') || undefined;

    const auditLogs = await prisma.auditLog.findMany({
      where: action ? { action } : undefined,
      take: limit,
      orderBy: { timestamp: 'desc' },
      include: {
        actorUser: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    const mapped = auditLogs.map((l) => ({
      ...l,
      createdAt: l.timestamp,
      user: l.actorUser,
    }));

    return NextResponse.json({
      auditLogs: mapped,
      total: mapped.length,
    });
  } catch (err: any) {
    const status = err.statusCode || 401;
    return NextResponse.json({ error: err.message || 'Nicht autorisiert' }, { status });
  }
}
