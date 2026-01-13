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

    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId required' },
        { status: 400 }
      );
    }

    const deleted = await prisma.session.deleteMany({
      where: {
        id: sessionId,
        userId: user.id,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: 'Сессия не найдена' }, { status: 404 });
    }

    // Логируем удаление конкретной сессии
    await logActivity(user.id, 'delete_session', req);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[SESSION_DELETE]', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
