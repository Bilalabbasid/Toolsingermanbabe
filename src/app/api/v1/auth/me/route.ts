import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/server/auth/guards';
import { getUserEntitlements } from '@/lib/monetization/entitlements';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    const entitlements = getUserEntitlements(user);

    return NextResponse.json({
      user,
      entitlements,
      authenticated: Boolean(user),
    });
  } catch (err: unknown) {
    console.error('[Auth Me Error]:', err);
    return NextResponse.json(
      { user: null, entitlements: getUserEntitlements(null), authenticated: false },
      { status: 200 }
    );
  }
}
