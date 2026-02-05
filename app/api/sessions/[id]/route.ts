import { NextResponse } from 'next/server';
import { withTracing } from '@/shared/lib/with-tracing';
import { prisma } from '@/prisma/prisma-client';
import { getUserFromRequest } from '@/shared/lib/get-user';
import { logActivity } from '@/shared/lib/log-activity';
import { verifyCsrf } from '@/shared/lib/verify-csrf';

export const DELETE = withTracing<{ id: string }>(async (req, ctx) => {
  const { requestId, params, latency } = ctx;

  const csrfError = verifyCsrf(req);
  if (csrfError) return csrfError;

  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', requestId },
      { status: 401 },
    );
  }

  const sessionId = params.id;
  if (!sessionId) {
    return NextResponse.json(
      { error: 'sessionId required', requestId },
      { status: 400 },
    );
  }

  const deleted = await prisma.session.deleteMany({
    where: {
      id: sessionId,
      userId: user.id,
    },
  });

  if (deleted.count === 0) {
    return NextResponse.json(
      { error: 'Сессия не найдена', requestId },
      { status: 404 },
    );
  }

  await logActivity(user.id, 'delete_session', req, {
    sessionId,
    latencyMs: latency,
  });

  return NextResponse.json({ success: true, requestId });
});
