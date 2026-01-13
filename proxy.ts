import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/shared/lib/auth-tokens';
import { prisma } from '@/prisma/prisma-client';
import { JwtPayload } from 'jsonwebtoken';

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

export default async function proxy(req: NextRequest) {
  try {
    const token =
      req.cookies.get('token')?.value ||
      req.headers.get('authorization')?.replace('Bearer ', '') ||
      '';

    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    let payload: JwtPayload & { userId: number; email: string };

    try {
      payload = verifyAccessToken(token) as JwtPayload & {
        userId: number;
        email: string;
      };
    } catch {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (!payload?.userId) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, fullName: true, role: true },
    });

    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('[PROXY] Ошибка:', error);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}
