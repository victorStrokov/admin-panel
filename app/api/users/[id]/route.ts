import { prisma } from '@/prisma/prisma-client';
import { logActivity } from '@/shared/lib/log-activity';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const userId = Number(params.id);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { sessions: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    role: user.role,
    provider: user.provider,
    banned: user.banned,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLogin: user.sessions[0]?.createdAt ?? null,
    sessions: user.sessions.map((s) => ({
      id: s.id,
      ip: s.ip,
      userAgent: s.userAgent,
      createdAt: s.createdAt,
    })),
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const userId = Number(params.id);

  await logActivity(userId, 'delete_user', req);

  await prisma.user.delete({
    where: { id: userId },
  });

  return NextResponse.json({ ok: true });
}
