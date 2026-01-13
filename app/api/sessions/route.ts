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

    const sessions = await prisma.session.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        deviceId: true,
        userAgent: true,
        ip: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Логируем просмотр списка сессий
    await logActivity(user.id, 'view_sessions', req);

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('[SESSIONS_GET]', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
