import { NextRequest, NextResponse } from 'next/server';
import {
  signAccessToken,
  generateRefreshToken,
  findSessionByRefreshToken,
  deleteSessionByRefreshToken,
  createSession,
} from '@/shared/lib/auth-tokens';
import { limiter } from '@/shared/lib/rate-limit';
import { logActivity } from '@/shared/lib/log-activity';

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    const { success } = await limiter.limit(ip);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const refreshToken =
      req.cookies.get('refreshToken')?.value ||
      req.headers.get('x-refresh-token') ||
      '';
    if (!refreshToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await findSessionByRefreshToken(refreshToken);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientDeviceId =
      req.headers.get('x-device-id') ||
      req.cookies.get('deviceId')?.value ||
      '';
    if (session.deviceId !== clientDeviceId) {
      await deleteSessionByRefreshToken(refreshToken);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.expiresAt < new Date()) {
      await deleteSessionByRefreshToken(refreshToken);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user;
    if (!user) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    // Новый accessToken
    const accessToken = signAccessToken({ userId: user.id, email: user.email });

    // Ротация refreshToken
    await deleteSessionByRefreshToken(refreshToken);
    const newRefreshToken = generateRefreshToken();

    await createSession({
      userId: user.id,
      refreshToken: newRefreshToken,
      deviceId: clientDeviceId,
      req,
    });

    const isSecure = process.env.SITE_URL?.startsWith('https://') ?? false;
    const res = NextResponse.json({ success: true, accessToken });

    await logActivity(user.id, 'refresh_token', req);

    res.cookies.set('token', accessToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60,
    });

    res.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    res.cookies.set('deviceId', clientDeviceId, {
      httpOnly: false,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error) {
    console.error('[AUTH_REFRESH]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
