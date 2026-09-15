import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/server/auth/guards';
import { prisma, isDatabaseConfigured } from '@/server/db/prisma';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ subscriptions: [], total: 0 });
    }

    const subscriptions = await prisma.subscription.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 100,
      include: {
        user: {
          select: { id: true, email: true, name: true, createdAt: true },
        },
      },
    });

    return NextResponse.json({ subscriptions, total: subscriptions.length });
  } catch (err: any) {
    const status = err.statusCode || 401;
    return NextResponse.json({ error: err.message || 'Nicht autorisiert' }, { status });
  }
}
