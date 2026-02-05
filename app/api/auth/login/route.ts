import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { withTracing } from '@/shared/lib/with-tracing';
import { prisma } from '@/prisma/prisma-client';
import {
  signAccessToken,
  generateRefreshToken,
  createSession,
} from '@/shared/lib/auth-tokens';
import { loginSchema } from '@/shared/lib/validation/auth';
import { limiter } from '@/shared/lib/rate-limit';
import { logActivity } from '@/shared/lib/log-activity';
import { generateCsrfToken } from '@/shared/lib/csrf';

export const POST = withTracing(async (req, ctx) => {
  const { requestId, latency } = ctx;

  const forwarded = req.headers.get('x-forwarded-for');
  const ip =
    forwarded?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-client-ip') ||
    'unknown';

  const { success } = await limiter.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests', requestId },
      { status: 429 },
    );
  }

  const body = await req.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten(), requestId },
      { status: 400 },
    );
  }

  const { email, password, deviceId } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    return NextResponse.json(
      { error: 'Unauthorized', requestId },
      { status: 401 },
    );
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return NextResponse.json(
      { error: 'Unauthorized', requestId },
      { status: 401 },
    );
  }

  const accessToken = signAccessToken({
    userId: user.id,
    email: user.email,
  });

  const refreshToken = generateRefreshToken();

  await createSession({
    userId: user.id,
    refreshToken,
    deviceId,
    req,
  });

  const csrfToken = generateCsrfToken();

  const res = NextResponse.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      tenantId: user.tenantId,
    },
    requestId,
  });

  await logActivity(user.id, 'login_user', req, {
    latencyMs: latency,
  });

  const isSecure = process.env.NODE_ENV === 'production';

  res.cookies.set('token', accessToken, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60,
  });

  res.cookies.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  res.cookies.set('deviceId', deviceId, {
    httpOnly: false,
    secure: process.env.SITE_URL?.startsWith('https://'),
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  res.cookies.set('csrfToken', csrfToken, {
    httpOnly: false,
    secure: isSecure,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
});
