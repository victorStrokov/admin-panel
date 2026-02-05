import { NextRequest, NextResponse } from 'next/server';
import { withTracing } from '@/shared/lib/with-tracing';
import { prisma } from '@/prisma/prisma-client';
import { deleteSessionByRefreshToken } from '@/shared/lib/auth-tokens';
import { getUserFromRequest } from '@/shared/lib/get-user';
import { logActivity } from '@/shared/lib/log-activity';

async function logout(req: NextRequest, requestId: string, latency: number) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', requestId },
      { status: 401 },
    );
  }

  const refreshToken =
    req.cookies.get('refreshToken')?.value ||
    req.headers.get('x-refresh-token') ||
    '';

  const deviceId =
    req.cookies.get('deviceId')?.value || req.headers.get('x-device-id') || '';

  if (refreshToken) {
    try {
      await deleteSessionByRefreshToken(refreshToken);
    } catch (err) {
      console.warn('[LOGOUT] Ошибка удаления по refreshToken', err);
    }
  }

  if (deviceId) {
    try {
      await prisma.session.deleteMany({
        where: { userId: user.id, deviceId },
      });
    } catch (err) {
      console.warn('[LOGOUT] Ошибка удаления по deviceId', err);
    }
  }

  await logActivity(user.id, 'logout_user', req, {
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
}

export const POST = withTracing(async (req, ctx) => {
  const { requestId, latency } = ctx;
  return logout(req, requestId, latency);
});

export const DELETE = withTracing(async (req, ctx) => {
  const { requestId, latency } = ctx;
  return logout(req, requestId, latency);
});
