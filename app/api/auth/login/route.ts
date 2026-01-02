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
/**
 *  login пользователя
 * @param req
 * @returns
 */
export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    const { success } = await limiter.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Слишком много запросов' },
        { status: 429 }
      );
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

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = generateRefreshToken();
    await createSession({ userId: user.id, refreshToken, deviceId, req });

    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });

    await logActivity(user.id, 'login', req);

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
    // Добавляем deviceId cookie
    res.cookies.set('deviceId', deviceId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    console.info(
      `[LOGIN] user=${user.id} ip=${ip} ua=${req.headers.get(
        'user-agent'
      )} deviceId=${deviceId}`
    );

    return res;
  } catch (error) {
    console.error('[LOGIN_POST]', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
