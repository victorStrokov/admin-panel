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

    const currentDeviceId = req.headers.get('x-device-id');
    if (!currentDeviceId) {
      return NextResponse.json(
        { error: 'Device ID required' },
        { status: 400 }
      );
    }

    // Удаляем все сессии пользователя, кроме текущей
    const deleted = await prisma.session.deleteMany({
      where: {
        userId: user.id,
        deviceId: { not: currentDeviceId },
      },
    });

    // Логируем действие
    await logActivity(user.id, 'delete_other_sessions', req);

    return NextResponse.json({ success: true, count: deleted.count });
  } catch (error) {
    console.error('[SESSION_DELETE_OTHERS]', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
