import { NextRequest, NextResponse } from 'next/server';
import { getSessionTokenFromCookie, destroySession, SESSION_COOKIE_NAME } from '@/server/auth/session';

export async function POST(req: NextRequest) {
  try {
    const token = await getSessionTokenFromCookie();
    if (token) {
      await destroySession(token);
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (err: unknown) {
    console.error('[Logout API Error]:', err);
    return NextResponse.json({ success: true });
  }
}
