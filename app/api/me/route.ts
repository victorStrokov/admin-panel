import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/shared/lib/auth-tokens';
import { prisma } from '@/prisma/prisma-client';

export async function GET(req: NextRequest) {
  try {
    // 1. Читаем токен только из cookie
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Нет токена' }, { status: 401 });
    }

    // 2. Проверяем токен
    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      return NextResponse.json(
        { error: 'Неверный или просроченный токен' },
        { status: 401 }
      );
    }

    // 3. Ищем пользователя
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // 4. Возвращаем данные
    return NextResponse.json({ user });
  } catch (error) {
    console.error('[ME_GET]', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
