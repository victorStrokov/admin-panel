import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';
import { z } from 'zod';
import { getUserFromRequest } from '@/shared/lib/get-user';
import { logActivity } from '@/shared/lib/log-activity';

// Валидация для массового удаления
const deleteManySchema = z.object({
  ids: z.array(z.number()).min(1, 'Нужно указать хотя бы один id'),
});

// =========================
// DELETE /api/users/delete-many
// =========================
export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = deleteManySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.format() },
        { status: 400 }
      );
    }

    const { ids } = parsed.data;

    // Удаляем только пользователей внутри текущего tenant
    const result = await prisma.user.deleteMany({
      where: {
        id: { in: ids },
        tenantId: user.tenantId,
      },
    });

    // Логируем массовое удаление
    await logActivity(user.id, 'delete_many_users', req);

    return NextResponse.json({ success: true, count: result.count });
  } catch (error) {
    console.error('[USERS_DELETE_MANY]', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
