import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';
import { withTracing } from '@/shared/lib/with-tracing';
import { getUserFromRequest } from '@/shared/lib/get-user';
import { limiter } from '@/shared/lib/rate-limit';
import { logActivity } from '@/shared/lib/log-activity';

export const GET = withTracing(async (req, ctx) => {
  const { requestId, latency } = ctx;

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-client-ip') ||
    'unknown';

  const { success } = await limiter.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests', requestId },
      { status: 429 },
    );
  }

  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', requestId },
      { status: 401 },
    );
  }

  const items = await prisma.inventory.findMany({
    where: { tenantId: user.tenantId },
    include: {
      productItem: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  await logActivity(user.id, 'view_inventory', req, {
    count: items.length,
    latencyMs: latency,
  });

  return NextResponse.json({ items, requestId });
});
