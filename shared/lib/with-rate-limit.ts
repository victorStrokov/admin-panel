import { NextRequest, NextResponse } from 'next/server';
import { limiter } from '@/shared/lib/rate-limit';

export function withRateLimit() {
  return function <
    P,
    R extends (req: NextRequest, ctx: P) => Promise<NextResponse>,
  >(handler: R): R {
    return (async (req: NextRequest, ctx: P) => {
      const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        req.headers.get('cf-connecting-ip') ||
        req.headers.get('x-client-ip') ||
        'unknown';

      const { success } = await limiter.limit(ip);

      if (!success) {
        return NextResponse.json(
          {
            error: 'Too many requests',
            requestId: (ctx as { requestId: string }).requestId,
          },
          { status: 429 },
        );
      }

      return handler(req, ctx);
    }) as R;
  };
}
