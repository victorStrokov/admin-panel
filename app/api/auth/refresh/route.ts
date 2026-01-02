import { NextResponse, NextRequest } from 'next/server';
import {
  signAccessToken,
  generateRefreshToken,
  findSessionByRefreshToken,
  deleteSessionByRefreshToken,
  createSession,
} from '@/shared/lib/auth-tokens';
import { limiter } from '@/shared/lib/rate-limit';
import { logActivity } from '@/shared/lib/log-activity';
/**
 *  refresh токена
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

    const refreshToken =
      req.cookies.get('refreshToken')?.value ||
      req.headers.get('x-refresh-token') ||
      '';

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Нет refresh токена' },
        { status: 401 }
      );
    }

    const session = await findSessionByRefreshToken(refreshToken);

    // СНАЧАЛА проверяем, что сессия существует
    if (!session) {
      console.warn(
        '[SECURITY] Попытка reuse старого refreshToken:',
        refreshToken
      );

      return NextResponse.json(
        { error: 'Сессия не найдена или токен недействителен' },
        { status: 401 }
      );
    }

    // Теперь можно безопасно читать session.deviceId
    const clientDeviceId =
      req.headers.get('x-device-id') ||
      req.cookies.get('deviceId')?.value ||
      '';

    if (session.deviceId !== clientDeviceId) {
      console.warn(
        '[SECURITY] deviceId mismatch — возможная кража refreshToken'
      );
      await deleteSessionByRefreshToken(refreshToken);
      return NextResponse.json(
        { error: 'Недействительная сессия' },
        { status: 401 }
      );
    }

    if (session.expiresAt < new Date()) {
      await deleteSessionByRefreshToken(refreshToken);
      return NextResponse.json({ error: 'Сессия истекла' }, { status: 401 });
    }

    const user = session.user;
    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // 1. Новый accessToken
    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
    });

    // 2. Ротация refreshToken
    await deleteSessionByRefreshToken(refreshToken);
    const newRefreshToken = generateRefreshToken();

    //  Передаём deviceId
    await createSession({
      userId: user.id,
      refreshToken: newRefreshToken,
      deviceId: clientDeviceId,
      req,
    });

    const res = NextResponse.json({
      success: true,
      accessToken,
    });

    await logActivity(user.id, 'refresh', req);

    res.cookies.set('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60,
    });

    res.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    //  deviceId должен быть тем же, что и clientDeviceId
    res.cookies.set('deviceId', clientDeviceId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    console.info(
      `[REFRESH] user=${user.id} oldSession=${refreshToken} newSession=${newRefreshToken}`
    );

    return res;
  } catch (error) {
    console.error('[REFRESH_POST] Ошибка:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
