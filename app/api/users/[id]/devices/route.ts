import { NextResponse } from 'next/server';
import { withTracing } from '@/shared/lib/with-tracing';
import { prisma } from '@/prisma/prisma-client';
import { allow } from '@/shared/lib/rbac';
import { logActivity } from '@/shared/lib/log-activity';

export const GET = withTracing<{ id: string }>(async (req, ctx) => {
  const { requestId, params } = ctx;

  const admin = await allow.admin(req);
  if (!admin) {
    return NextResponse.json(
      { error: 'Forbidden', requestId },
      { status: 403 },
    );
  }

  const id = Number(params.id);
  if (!id) {
    return NextResponse.json(
      { error: 'Некорректный user id', requestId },
      { status: 400 },
    );
  }

  const targetUser = await prisma.user.findFirst({
    where: { id, tenantId: admin.tenantId },
    select: { id: true },
  });

  if (!targetUser) {
    return NextResponse.json(
      { error: 'Пользователь не найден', requestId },
      { status: 404 },
    );
  }

  const sessions = await prisma.session.findMany({
    where: { userId: id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      ip: true,
      userAgent: true,
      createdAt: true,
      updatedAt: true,
      deviceId: true,
    },
  });

  await logActivity(admin.id, 'view_user_devices', req, { userId: id });

  return NextResponse.json({ sessions, requestId });
});
