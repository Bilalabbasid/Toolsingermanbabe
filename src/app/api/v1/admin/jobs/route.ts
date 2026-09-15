import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/server/auth/guards';
import { prisma, isDatabaseConfigured } from '@/server/db/prisma';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ jobs: [], total: 0 });
    }

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');
    const toolSlug = searchParams.get('toolSlug');

    const where: any = {};
    if (status && status !== 'all') where.status = status;
    if (toolSlug && toolSlug !== 'all') where.toolSlug = toolSlug;

    const jobs = await prisma.conversionJob.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    return NextResponse.json({ jobs, total: jobs.length });
  } catch (err: any) {
    const status = err.statusCode || 401;
    return NextResponse.json({ error: err.message || 'Nicht autorisiert' }, { status });
  }
}
