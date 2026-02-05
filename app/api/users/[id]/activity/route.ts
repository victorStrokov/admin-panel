import { NextResponse } from 'next/server';
import { withTracing } from '@/shared/lib/with-tracing';
import { prisma } from '@/prisma/prisma-client';
import { allow } from '@/shared/lib/rbac';
import { logActivity } from '@/shared/lib/log-activity';
import { verifyCsrf } from '@/shared/lib/verify-csrf';
import { limiter } from '@/shared/lib/rate-limit';

export const POST = withTracing<{ id: string }>(async (req, ctx) => {
  const { requestId, params } = ctx;

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

  const id = Number(params.id);
  if (!id) {
    return NextResponse.json(
      { error: 'Некорректный id', requestId },
      { status: 400 },
    );
  }

  const updated = await prisma.user.updateMany({
    where: { id, tenantId: admin.tenantId },
    data: { banned: true },
  });

  if (updated.count === 0) {
    return NextResponse.json(
      { error: 'Пользователь не найден', requestId },
      { status: 404 },
    );
  }

  await logActivity(admin.id, 'ban_user', req, { userId: id });

  return NextResponse.json({ success: true, requestId });
});
