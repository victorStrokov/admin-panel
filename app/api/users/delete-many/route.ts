import { NextResponse } from 'next/server';
import { withTracing } from '@/shared/lib/with-tracing';
import { prisma } from '@/prisma/prisma-client';
import { z } from 'zod';
import { allow } from '@/shared/lib/rbac';
import { logActivity } from '@/shared/lib/log-activity';
import { verifyCsrf } from '@/shared/lib/verify-csrf';
import { limiter } from '@/shared/lib/rate-limit';
const deleteManySchema = z.object({
  ids: z.array(z.number()).min(1, 'Нужно указать хотя бы один id'),
});

export const DELETE = withTracing(async (req, ctx) => {
  const { requestId, latency } = ctx;

  try {
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

    const csrfError = verifyCsrf(req);
    if (csrfError) return csrfError;

    const admin = await allow.admin(req);
    if (!admin) {
      return NextResponse.json(
        { error: 'Forbidden', requestId },
        { status: 403 },
      );
    }

    const body = await req.json();
    const parsed = deleteManySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.format(), requestId },
        { status: 400 },
      );
    }

    const { ids } = parsed.data;

    const result = await prisma.user.deleteMany({
      where: {
        id: { in: ids },
        tenantId: admin.tenantId,
      },
    });

    await logActivity(admin.id, 'delete_many_users', req, {
      ids,
      count: result.count,
      latencyMs: latency,
    });

    return NextResponse.json({ success: true, count: result.count, requestId });
  } catch (error) {
    console.error('[USERS_DELETE_MANY]', { error, requestId });

    return NextResponse.json(
      { error: 'Ошибка сервера', requestId },
      { status: 500 },
    );
  }
});
