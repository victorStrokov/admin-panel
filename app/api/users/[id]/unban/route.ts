import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';
import { getUserFromRequest } from '@/shared/lib/get-user';
import { logActivity } from '@/shared/lib/log-activity';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const p = await context.params;
    const id = Number(p.id);
    if (!id)
      return NextResponse.json({ error: 'Некорректный id' }, { status: 400 });

    const updated = await prisma.user.updateMany({
      where: { id, tenantId: user.tenantId },
      data: { banned: false },
    });

    if (updated.count === 0) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Логируем действие администратора
    await logActivity(user.id, 'unban_user', req);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[USER_UNBAN]', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
