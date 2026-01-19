import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/shared/lib/auth-tokens';
import { prisma } from '@/prisma/prisma-client';
import { JwtPayload } from 'jsonwebtoken';

// Разрешённые источники для CORS
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
];

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin);
}

function addCorsHeaders(
  response: NextResponse,
  origin: string | null,
): NextResponse {
  if (isOriginAllowed(origin) && origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  // Заголовки безопасности
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

export default async function proxy(req: NextRequest) {
  const origin = req.headers.get('origin');

  try {
    const token =
      req.cookies.get('token')?.value ||
      req.headers.get('authorization')?.replace('Bearer ', '') ||
      '';

    if (!token) {
      const response = NextResponse.redirect(new URL('/login', req.url));
      return addCorsHeaders(response, origin);
    }

    let payload: JwtPayload & { userId: number; email: string };

    try {
      payload = verifyAccessToken(token) as JwtPayload & {
        userId: number;
        email: string;
      };
    } catch {
      const response = NextResponse.redirect(new URL('/login', req.url));
      return addCorsHeaders(response, origin);
    }

    if (!payload?.userId) {
      const response = NextResponse.redirect(new URL('/login', req.url));
      return addCorsHeaders(response, origin);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, fullName: true, role: true },
    });

    if (!user) {
      const response = NextResponse.redirect(new URL('/login', req.url));
      return addCorsHeaders(response, origin);
    }

    if (user.role !== 'ADMIN') {
      const response = NextResponse.redirect(new URL('/', req.url));
      return addCorsHeaders(response, origin);
    }

    const response = NextResponse.next();
    return addCorsHeaders(response, origin);
  } catch (error) {
    console.error('[PROXY] Ошибка:', error);
    const response = NextResponse.redirect(new URL('/login', req.url));
    return addCorsHeaders(response, origin);
  }
}
