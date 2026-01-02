import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/prisma/prisma-client';
import { deleteSessionByRefreshToken } from '@/shared/lib/auth-tokens';
import { logActivity } from '@/shared/lib/log-activity';

export async function POST(req: NextRequest) {
  try {
    const refreshToken =
      req.cookies.get('refreshToken')?.value ||
      req.headers.get('x-refresh-token') ||
      '';

    const deviceId =
      req.cookies.get('deviceId')?.value ||
      req.headers.get('x-device-id') ||
      '';

    // 1. Определяем пользователя по refreshToken
    let user: { id: number } | null = null;

    if (refreshToken) {
      const session = await prisma.session.findUnique({
        where: { refreshToken },
        select: { userId: true },
      });

      if (session) {
        user = { id: session.userId };
      }
    }

    // 2. Логируем logout
    if (user) {
      await logActivity(user.id, 'logout', req);
    }

    // 3. Удаляем сессию по refreshToken
    if (refreshToken) {
      try {
        await deleteSessionByRefreshToken(refreshToken);
      } catch {}
    }

    // 4. Удаляем сессию по deviceId
    if (deviceId) {
      try {
        await prisma.session.deleteMany({
          where: { deviceId },
        });
      } catch {}
    }

    // 5. Очищаем cookie
    const res = NextResponse.json({ success: true });

    res.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    });

    res.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    });

    res.cookies.set('deviceId', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    });

    console.info(`[LOGOUT] deviceId=${deviceId} refreshToken=${refreshToken}`);

    return res;
  } catch (error) {
    console.error('[LOGOUT_POST] Ошибка:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
