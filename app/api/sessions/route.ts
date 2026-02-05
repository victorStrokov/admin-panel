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

  const sessions = await prisma.session.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      deviceId: true,
      userAgent: true,
      ip: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  await logActivity(user.id, 'view_sessions', req, {
    count: sessions.length,
    latencyMs: latency,
  });

  return NextResponse.json({ sessions, requestId });
});
