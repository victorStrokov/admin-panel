import { NextResponse } from 'next/server';
import { withTracing } from '@/shared/lib/with-tracing';
import { prisma } from '@/prisma/prisma-client';
import { Prisma, UserRole } from '@prisma/client';
import { allow } from '@/shared/lib/rbac';
import { logger } from '@/shared/logger';

export const GET = withTracing(async (req, ctx) => {
  const { requestId, latency } = ctx;

  try {
    const admin = await allow.admin(req);
    if (!admin) {
      return NextResponse.json(
        { error: 'Forbidden', requestId },
        { status: 403 },
      );
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

    const allowedSortFields = ['id', 'email', 'createdAt', 'role'];
    const safeSort = allowedSortFields.includes(sort) ? sort : 'id';

    const where: Prisma.UserWhereInput = { tenantId: admin.tenantId };

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

    const total = await prisma.user.count({ where });

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

    logger.info(
      {
        requestId,
        latency,
        adminId: admin.id,
        count: users.length,
      },
      'Users list fetched',
    );

    return NextResponse.json({ users, total, requestId });
  } catch (error) {
    logger.error(
      { requestId, latency, error: String(error) },
      'Users list failed',
    );

    return NextResponse.json(
      { error: 'Ошибка сервера', requestId },
      { status: 500 },
    );
  }
});
