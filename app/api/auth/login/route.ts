import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/prisma/prisma-client';
import {
  signAccessToken,
  generateRefreshToken,
  createSession,
} from '@/shared/lib/auth-tokens';
import { loginSchema } from '@/shared/lib/validation/auth';
import { limiter } from '@/shared/lib/rate-limit';
import { logActivity } from '@/shared/lib/log-activity';

export async function POST(req: NextRequest) {
  try {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip =
      forwarded?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      req.headers.get('cf-connecting-ip') || // Cloudflare
      req.headers.get('x-client-ip') || // некоторые прокси
      'unknown';

    const { success } = await limiter.limit(ip);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password, deviceId } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken();

    await createSession({ userId: user.id, refreshToken, deviceId, req });

    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        tenantId: user.tenantId,
      },
    });

    await logActivity(user.id, 'login_user', req);

    res.cookies.set('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60,
    });

    res.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
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

    return res;
  } catch (error) {
    console.error('[AUTH_LOGIN]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
