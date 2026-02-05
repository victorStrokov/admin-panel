import { NextResponse } from 'next/server';
import { withTracing } from '@/shared/lib/with-tracing';
import { prisma } from '@/prisma/prisma-client';
import { getUserFromRequest } from '@/shared/lib/get-user';
import { logActivity } from '@/shared/lib/log-activity';

export const GET = withTracing(async (req, ctx) => {
  const { requestId, latency } = ctx;

  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', requestId },
      { status: 401 },
    );
  }

  const me = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      tenantId: true,
      createdAt: true,
    },
  });

  if (!me) {
    return NextResponse.json(
      { error: 'Пользователь не найден', requestId },
      { status: 404 },
    );
  }

  await logActivity(user.id, 'view_me', req, {
    latencyMs: latency,
  });

  return NextResponse.json({ user: me, requestId });
});
