import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';
import { z } from 'zod';
import { getUserFromRequest } from '@/shared/lib/get-user';
import { logActivity } from '@/shared/lib/log-activity';

// Валидация для обновления пользователя
const updateUserSchema = z.object({
  email: z.string().email().optional(),
  fullName: z.string().min(2).optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'USER']).optional(),
});

// =========================
// GET /api/users/[id]
// =========================
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = await getUserFromRequest(req);
    console.log('[USERS_[ID]_GET] Current user:', user);

    if (!user || user.role !== 'ADMIN') {
      console.log(
        '[USERS_[ID]_GET] Access denied. User:',
        user,
        'Role:',
        user?.role
      );
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const params = await context.params;
    const userId = parseInt(params.id);

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        banned: true,
        createdAt: true,
        tenantId: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Проверка, что пользователь из того же тенанта
    if (targetUser.tenantId !== user.tenantId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Логируем просмотр пользователя
    await logActivity(user.id, 'view_user', req);

    return NextResponse.json({ user: targetUser });
  } catch (error) {
    console.error('[USERS_[ID]_GET]', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// =========================
// PUT /api/users/[id]
// =========================
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const params = await context.params;
    const userId = parseInt(params.id);

    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.format() },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Проверка, что пользователь из того же тенанта
    if (targetUser.tenantId !== user.tenantId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: parsed.data,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        banned: true,
        createdAt: true,
      },
    });

    // Логируем обновление пользователя
    await logActivity(user.id, 'update_user', req);

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('[USERS_[ID]_PUT]', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// =========================
// DELETE /api/users/[id]
// =========================
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const params = await context.params;
    const userId = parseInt(params.id);

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Проверка, что пользователь из того же тенанта
    if (targetUser.tenantId !== user.tenantId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    // Логируем удаление пользователя
    await logActivity(user.id, 'delete_user', req);

    return NextResponse.json({ message: 'Пользователь удалён' });
  } catch (error) {
    console.error('[USERS_[ID]_DELETE]', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
