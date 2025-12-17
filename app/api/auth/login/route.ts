import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '@/prisma/prisma-client';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 401 }
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: 'У пользователя нет пароля' },
        { status: 400 }
      );
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Неверный пароль' }, { status: 401 });
    }

    // Генерируем JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    // Формируем ответ и ставим cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('token', token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60, // 1 час
    });

    return response;
  } catch (error) {
    console.error('Ошибка при логине:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
