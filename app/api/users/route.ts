import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';
import { Prisma, UserRole } from '@prisma/client';
import { getUserFromRequest } from '@/shared/lib/get-user';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(req.url);

    const page = Number(url.searchParams.get('page') ?? 1);
    const perPage = Number(url.searchParams.get('perPage') ?? 10);

    const sort = url.searchParams.get('sort') ?? 'id';
    const dir = url.searchParams.get('dir') === 'desc' ? 'desc' : 'asc';

    const role = url.searchParams.get('role') ?? '';
    const status = url.searchParams.get('status') ?? '';
    const search = url.searchParams.get('search') ?? '';
    const dateFrom = url.searchParams.get('dateFrom') ?? '';
    const dateTo = url.searchParams.get('dateTo') ?? '';

    // ============================
    // 1. Безопасный sort
    // ============================
    const allowedSortFields = ['id', 'email', 'createdAt', 'role'];
    const safeSort = allowedSortFields.includes(sort) ? sort : 'id';

    // ============================
    // 2. Формируем where
    // ============================
    const where: Prisma.UserWhereInput = { tenantId: user.tenantId };

    if (role) where.role = role as UserRole;
    if (status === 'banned') where.banned = true;
    if (status === 'active') where.banned = false;

    if (search) {
      where.email = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    // ============================
    // 3. Получаем total
    // ============================
    const total = await prisma.user.count({ where });

    // ============================
    // 4. Получаем пользователей
    // ============================
    const users = await prisma.user.findMany({
      where,
      orderBy: { [safeSort]: dir },
      skip: (page - 1) * perPage,
      take: perPage === 0 ? undefined : perPage,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        banned: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ users, total });
  } catch (error) {
    console.error('[USERS_GET]', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
