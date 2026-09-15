import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/server/auth/guards';
import { prisma, isDatabaseConfigured } from '@/server/db/prisma';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ users: [], total: 0 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        subscription: true,
        _count: {
          select: { jobs: true },
        },
      },
    });

    const safeUsers = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      plan: u.subscription?.plan || 'free',
      subscriptionStatus: u.subscription?.status || 'active',
      jobsCount: u._count.jobs,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
    }));

    return NextResponse.json({ users: safeUsers, total: safeUsers.length });
  } catch (err: any) {
    const status = err.statusCode || 401;
    return NextResponse.json({ error: err.message || 'Nicht autorisiert' }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    const body = await req.json();
    const { userId, role, plan } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId ist erforderlich.' }, { status: 400 });
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Datenbank ist nicht konfiguriert.' }, { status: 503 });
    }

    if (role && ['USER', 'ADMIN'].includes(role)) {
      await prisma.user.update({
        where: { id: userId },
        data: { role },
      });
    }

    if (plan && ['free', 'pro', 'business'].includes(plan)) {
      await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          plan,
          status: 'active',
        },
        update: {
          plan,
        },
      });
    }

    // Audit Log
    await prisma.auditLog.create({
      data: {
        actorUserId: admin.id,
        action: 'USER_UPDATED',
        targetType: 'User',
        targetId: userId,
        metadata: JSON.stringify({ role, plan, timestamp: new Date().toISOString() }),
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, userId });
  } catch (err: any) {
    const status = err.statusCode || 500;
    return NextResponse.json({ error: err.message || 'Fehler beim Aktualisieren des Benutzers' }, { status });
  }
}
