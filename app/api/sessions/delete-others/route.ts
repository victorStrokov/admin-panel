import { NextResponse } from 'next/server';
import { withTracing } from '@/shared/lib/with-tracing';
import { prisma } from '@/prisma/prisma-client';
import { getUserFromRequest } from '@/shared/lib/get-user';
import { logActivity } from '@/shared/lib/log-activity';
import { verifyCsrf } from '@/shared/lib/verify-csrf';

export const DELETE = withTracing(async (req, ctx) => {
  const { requestId, latency } = ctx;

  const csrfError = verifyCsrf(req);
  if (csrfError) return csrfError;

  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', requestId },
      { status: 401 },
    );
  }

  const currentDeviceId = req.headers.get('x-device-id');
  if (!currentDeviceId) {
    return NextResponse.json(
      { error: 'Device ID required', requestId },
      { status: 400 },
    );
  }

  const deleted = await prisma.session.deleteMany({
    where: {
      userId: user.id,
      deviceId: { not: currentDeviceId },
    },
  });

  await logActivity(user.id, 'delete_other_sessions', req, {
    deletedCount: deleted.count,
    latencyMs: latency,
  });

  return NextResponse.json({
    success: true,
    count: deleted.count,
    requestId,
  });
});
