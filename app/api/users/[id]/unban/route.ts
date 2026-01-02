import { prisma } from '@/prisma/prisma-client';
import { logActivity } from '@/shared/lib/log-activity';
import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = Number(params.id);

    // 1. Снимаем бан
    await prisma.user.update({
      where: { id: userId },
      data: { banned: false },
    });

    // 2. Логируем действие
    await logActivity(userId, 'unban', req);

    // 3. Возвращаем ответ
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[UNBAN_ERROR]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
