import { prisma } from '@/prisma/prisma-client';
import { logActivity } from '@/shared/lib/log-activity';
import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const userId = Number(params.id);

  await prisma.user.update({
    where: { id: userId },
    data: { banned: true },
  });

  await logActivity(userId, 'ban', req);

  return NextResponse.json({ success: true });
}
