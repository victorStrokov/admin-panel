import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';
import { getUserFromRequest } from '@/shared/lib/get-user';
import { logActivity } from '@/shared/lib/log-activity';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const p = await context.params;
    const id = Number(p.id);
    if (!id)
      return NextResponse.json(
        { error: 'Некорректный user id' },
        { status: 400 }
      );

    // Проверяем, что целевой пользователь принадлежит текущему tenant
    const targetUser = await prisma.user.findFirst({
      where: { id, tenantId: user.tenantId },
      select: { id: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    const logs = await prisma.activityLog.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        action: true,
        ip: true,
        userAgent: true,
        createdAt: true,
      },
    });

    // Логируем просмотр активности
    await logActivity(user.id, 'view_user_activity', req);

    return NextResponse.json(logs);
  } catch (error) {
    console.error('[USER_ACTIVITY_GET]', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
