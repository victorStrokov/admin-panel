import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  let csrfToken = req.cookies.get('csrfToken')?.value;

  if (!csrfToken) {
    csrfToken = randomUUID();

    res.cookies.set('csrfToken', csrfToken, {
      httpOnly: false,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|api/auth).*)'],
};
