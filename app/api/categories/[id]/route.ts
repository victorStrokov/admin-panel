import { prisma } from '@/prisma/prisma-client';
import { getUserFromRequest } from '@/shared/lib/get-user';
import { logActivity } from '@/shared/lib/log-activity';
import { allow } from '@/shared/lib/rbac';
import { verifyCsrf } from '@/shared/lib/verify-csrf';
import { withTracing } from '@/shared/lib/with-tracing';
import { NextResponse } from 'next/server';
import slugify from 'slugify';
import z from 'zod';

const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  parentId: z.number().optional(),
});

export const GET = withTracing<{ id: string }>(async (req, ctx) => {
  const { requestId, params } = ctx;

  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', requestId },
      { status: 401 },
    );
  }

  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json(
      { error: 'Invalid ID', requestId },
      { status: 400 },
    );
  }

  const category = await prisma.category.findFirst({
    where: { id, tenantId: user.tenantId },
  });

  if (!category) {
    return NextResponse.json(
      { error: 'Category not found', requestId },
      { status: 404 },
    );
  }

  return NextResponse.json({ category, requestId });
});

export const PUT = withTracing<{ id: string }>(async (req, ctx) => {
  const { requestId, params, latency } = ctx;

  const csrfError = verifyCsrf(req);
  if (csrfError) return csrfError;

  const staff = await allow.manageProducts(req);
  if (!staff) {
    return NextResponse.json(
      { error: 'Forbidden', requestId },
      { status: 403 },
    );
  }

  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json(
      { error: 'Invalid ID', requestId },
      { status: 400 },
    );
  }

  const body = await req.json();
  const parsed = categorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.format(), requestId },
      { status: 400 },
    );
  }

  const { name, slug, parentId } = parsed.data;

  const category = await prisma.category.update({
    where: { id, tenantId: staff.tenantId },
    data: {
      name,
      slug: slug ?? slugify(name, { lower: true }),
      parentId: parentId ?? null,
    },
  });

  await logActivity(staff.id, 'update_category', req, {
    categoryId: id,
    latencyMs: latency,
  });

  return NextResponse.json({ category, requestId });
});

export const DELETE = withTracing<{ id: string }>(async (req, ctx) => {
  const { requestId, params, latency } = ctx;

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
  if (isNaN(id)) {
    return NextResponse.json(
      { error: 'Invalid ID', requestId },
      { status: 400 },
    );
  }

  const deleted = await prisma.category.deleteMany({
    where: { id, tenantId: admin.tenantId },
  });

  if (deleted.count === 0) {
    return NextResponse.json(
      { error: 'Category not found', requestId },
      { status: 404 },
    );
  }

  await logActivity(admin.id, 'delete_category', req, {
    categoryId: id,
    latencyMs: latency,
  });

  return NextResponse.json({ success: true, requestId });
});
