import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';
import { getUserFromRequest } from '@/shared/lib/get-user';
import { logActivity } from '@/shared/lib/log-activity';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const me = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        tenantId: true,
        createdAt: true,
      },
    });

    if (!me) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Логируем просмотр профиля
    await logActivity(user.id, 'view_me', req);

    return NextResponse.json({ user: me });
  } catch (error) {
    console.error('[ME_GET]', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
