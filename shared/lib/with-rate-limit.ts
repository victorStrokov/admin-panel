import { NextRequest, NextResponse } from 'next/server';
import { limiter } from '@/shared/lib/rate-limit';

export async function withRateLimit(
  req: NextRequest,
  handler: () => Promise<NextResponse>,
) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  const { success } = await limiter.limit(ip);

  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  return handler();
}
