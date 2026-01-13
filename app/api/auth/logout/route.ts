import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';
import { deleteSessionByRefreshToken } from '@/shared/lib/auth-tokens';
import { getUserFromRequest } from '@/shared/lib/get-user';
import { logActivity } from '@/shared/lib/log-activity';

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const refreshToken =
      req.cookies.get('refreshToken')?.value ||
      req.headers.get('x-refresh-token') ||
      '';
    const deviceId =
      req.cookies.get('deviceId')?.value ||
      req.headers.get('x-device-id') ||
      '';

    // Удаляем сессию по refreshToken
    if (refreshToken) {
      try {
        await deleteSessionByRefreshToken(refreshToken);
      } catch (err) {
        console.warn('[LOGOUT] Ошибка удаления по refreshToken', err);
      }
    }

    // Удаляем сессию по deviceId
    if (deviceId) {
      try {
        await prisma.session.deleteMany({
          where: { userId: user.id, deviceId },
        });
      } catch (err) {
        console.warn('[LOGOUT] Ошибка удаления по deviceId', err);
      }
    }

    // Логируем действие
    await logActivity(user.id, 'logout_user', req);

    // Очищаем cookie
    const res = NextResponse.json({ success: true });
    const isSecure = process.env.SITE_URL?.startsWith('https://') ?? false;

    res.cookies.set('token', '', {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    });

    res.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    });

    res.cookies.set('deviceId', '', {
      httpOnly: false,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    });

    return res;
  } catch (error) {
    console.error('[AUTH_LOGOUT]', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
