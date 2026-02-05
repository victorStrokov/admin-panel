import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { withTracing } from '@/shared/lib/with-tracing';
import { prisma } from '@/prisma/prisma-client';
import { registerSchema } from '@/shared/lib/validation/auth';
import { logActivity } from '@/shared/lib/log-activity';
import { getUserFromRequest } from '@/shared/lib/get-user';
import { limiter } from '@/shared/lib/rate-limit';

export const POST = withTracing(async (req, ctx) => {
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

  const body = await req.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten(), requestId },
      { status: 400 },
    );
  }

  const { fullName, email, password } = parsed.data;

  const emailNormalized = email.toLowerCase();

  const exists = await prisma.user.findUnique({
    where: { email: emailNormalized },
  });

  if (exists) {
    return NextResponse.json(
      { error: 'Conflict: email already registered', requestId },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const currentUser = await getUserFromRequest(req);
  const tenantId = currentUser?.tenantId ?? 1;

  const user = await prisma.user.create({
    data: {
      fullName,
      email: emailNormalized,
      passwordHash,
      tenantId,
      role: 'USER',
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      tenantId: true,
      createdAt: true,
    },
  });

  await logActivity(user.id, 'register_user', req, {
    email: user.email,
    latencyMs: latency,
  });

  return NextResponse.json({ success: true, user, requestId });
});
