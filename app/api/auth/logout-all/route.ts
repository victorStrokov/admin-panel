import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';
import { verifyAccessToken } from '@/shared/lib/auth-tokens';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Удаляем все сессии пользователя
    await prisma.session.deleteMany({
      where: { userId: payload.userId },
    });

    // Чистим куки
    const res = NextResponse.json({ success: true });

    res.cookies.set('token', '', { maxAge: 0 });
    res.cookies.set('refreshToken', '', { maxAge: 0 });
    res.cookies.set('deviceId', '', { maxAge: 0 });

    return res;
  } catch (e) {
    console.error('[LOGOUT_ALL]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
