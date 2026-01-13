import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';
import { getUserFromRequest } from '@/shared/lib/get-user';
import { logActivity } from '@/shared/lib/log-activity';

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Удаляем все сессии пользователя
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    // Логируем действие
    await logActivity(user.id, 'logout_all_sessions', req);

    // Чистим куки
    const isSecure = process.env.SITE_URL?.startsWith('https://') ?? false;
    const res = NextResponse.json({ success: true });

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
    console.error('[AUTH_LOGOUT_ALL]', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
