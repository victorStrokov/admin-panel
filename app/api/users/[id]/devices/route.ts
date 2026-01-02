import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const userId = Number(params.id);

  if (Number.isNaN(userId)) {
    return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
  }

  const sessions = await prisma.session.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    // сюда можно добавить select, если не нужны все поля
  });

  return NextResponse.json(sessions);
}
