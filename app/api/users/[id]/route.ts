import { NextResponse } from 'next/server';
import { withTracing } from '@/shared/lib/with-tracing';
import { prisma } from '@/prisma/prisma-client';
import { z } from 'zod';
import { allow } from '@/shared/lib/rbac';
import { logActivity } from '@/shared/lib/log-activity';
import { verifyCsrf } from '@/shared/lib/verify-csrf';

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  fullName: z.string().min(2).optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'USER']).optional(),
});

export const GET = withTracing<{ id: string }>(async (req, ctx) => {
  const { requestId, params } = ctx;

  const admin = await allow.admin(req);
  if (!admin) {
    return NextResponse.json(
      { error: 'Forbidden', requestId },
      { status: 403 },
    );
  }

  const userId = parseInt(params.id);

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      banned: true,
      createdAt: true,
      tenantId: true,
    },
  });

  if (!targetUser) {
    return NextResponse.json(
      { error: 'Пользователь не найден', requestId },
      { status: 404 },
    );
  }

  if (targetUser.tenantId !== admin.tenantId) {
    return NextResponse.json(
      { error: 'Forbidden', requestId },
      { status: 403 },
    );
  }

  await logActivity(admin.id, 'view_user', req, { userId });

  return NextResponse.json({ user: targetUser, requestId });
});

export const PUT = withTracing<{ id: string }>(async (req, ctx) => {
  const { requestId, params } = ctx;

  const csrfError = verifyCsrf(req);
  if (csrfError) return csrfError;

  const admin = await allow.admin(req);
  if (!admin) {
    return NextResponse.json(
      { error: 'Forbidden', requestId },
      { status: 403 },
    );
  }

  const userId = parseInt(params.id);

  const body = await req.json();
  const parsed = updateUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.format(), requestId },
      { status: 400 },
    );
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!targetUser) {
    return NextResponse.json(
      { error: 'Пользователь не найден', requestId },
      { status: 404 },
    );
  }

  if (targetUser.tenantId !== admin.tenantId) {
    return NextResponse.json(
      { error: 'Forbidden', requestId },
      { status: 403 },
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: parsed.data,
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      banned: true,
      createdAt: true,
    },
  });

  await logActivity(admin.id, 'update_user', req, {
    userId,
    changes: parsed.data,
  });

  return NextResponse.json({ user: updatedUser, requestId });
});

export const DELETE = withTracing<{ id: string }>(async (req, ctx) => {
  const { requestId, params } = ctx;

  const csrfError = verifyCsrf(req);
  if (csrfError) return csrfError;

  const admin = await allow.admin(req);
  if (!admin) {
    return NextResponse.json(
      { error: 'Forbidden', requestId },
      { status: 403 },
    );
  }

  const userId = parseInt(params.id);

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!targetUser) {
    return NextResponse.json(
      { error: 'Пользователь не найден', requestId },
      { status: 404 },
    );
  }

  if (targetUser.tenantId !== admin.tenantId) {
    return NextResponse.json(
      { error: 'Forbidden', requestId },
      { status: 403 },
    );
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  await logActivity(admin.id, 'delete_user', req, { userId });

  return NextResponse.json({ message: 'Пользователь удалён', requestId });
});
