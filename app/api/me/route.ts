import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
  const cookieHeader = req.headers.get('cookie');
  const token = cookieHeader?.match(/token=([^;]+)/)?.[1];

  if (!token) {
    return NextResponse.json({ error: 'Нет токена' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    return NextResponse.json({ user: decoded });
  } catch {
    return NextResponse.json(
      { error: 'Неверный или просроченный токен' },
      { status: 401 }
    );
  }
}
