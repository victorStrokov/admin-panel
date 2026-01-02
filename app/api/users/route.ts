import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';
import { Prisma, UserRole } from '@prisma/client';

export async function GET(req: Request) {
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

  const where: Prisma.UserWhereInput = {};

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
    orderBy: { [sort]: dir },
    skip: (page - 1) * perPage,
    take: perPage === 0 ? undefined : perPage,
  });

  return NextResponse.json({ users, total });
}
