import { NextResponse } from 'next/server';
import { withTracing } from '@/shared/lib/with-tracing';
import { prisma } from '@/prisma/prisma-client';
import { getUserFromRequest } from '@/shared/lib/get-user';
import { logActivity } from '@/shared/lib/log-activity';

export const DELETE = withTracing(async (req, ctx) => {
  const { requestId, latency } = ctx;

  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', requestId },
      { status: 401 },
    );
  }

  await prisma.session.deleteMany({
    where: { userId: user.id },
  });

  await logActivity(user.id, 'logout_all_sessions', req, {
    latencyMs: latency,
  });

  const isSecure = process.env.SITE_URL?.startsWith('https://') ?? false;

  const res = NextResponse.json({ success: true, requestId });

  res.cookies.set('token', '', {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  res.cookies.set('refreshToken', '', {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  res.cookies.set('deviceId', '', {
    httpOnly: false,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  return res;
});
