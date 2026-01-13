import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/prisma/prisma-client';
import { registerSchema } from '@/shared/lib/validation/auth';
import { logActivity } from '@/shared/lib/log-activity';
import { getUserFromRequest } from '@/shared/lib/get-user';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Валидация входных данных
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { fullName, email, password } = parsed.data;

    // 2. Нормализуем email
    const emailNormalized = email.toLowerCase();

    // 3. Проверяем, существует ли пользователь
    const exists = await prisma.user.findUnique({
      where: { email: emailNormalized },
    });

    if (exists) {
      return NextResponse.json(
        { error: 'Conflict: email already registered' },
        { status: 409 }
      );
    }

    // 4. Хэшируем пароль
    const passwordHash = await bcrypt.hash(password, 10);

    // 5. Определяем tenantId (например, из текущего пользователя-админа или дефолтного)
    const currentUser = await getUserFromRequest(req);
    const tenantId = currentUser?.tenantId ?? 1; // fallback, если регистрация публичная

    // 6. Создаём пользователя
    const user = await prisma.user.create({
      data: {
        fullName,
        email: emailNormalized,
        passwordHash,
        tenantId,
        role: 'USER',
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        tenantId: true,
        createdAt: true,
      },
    });

    // 7. Логируем регистрацию
    await logActivity(user.id, 'register_user', req);

    // 8. Возвращаем безопасный ответ
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('[AUTH_REGISTER]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
