import { NextResponse } from 'next/server';
import { withTracing } from '@/shared/lib/with-tracing';
import { prisma } from '@/prisma/prisma-client';
import { getUserFromRequest } from '@/shared/lib/get-user';
import { allow } from '@/shared/lib/rbac';
import { logActivity } from '@/shared/lib/log-activity';
import { z } from 'zod';
import { verifyCsrf } from '@/shared/lib/verify-csrf';

const productSchema = z.object({
  name: z.string().min(2),
  imageUrl: z.string().url().optional(),
  slug: z.string().optional(),
  shortDesc: z.string().optional(),
  fullDesc: z.string().optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED', 'DRAFT']).default('ACTIVE'),
  categoryId: z.number(),
});

// GET /api/products/[id]
// Доступно всем авторизованным пользователям

export const GET = withTracing<{ id: string }>(async (req, ctx) => {
  const { requestId, params, latency } = ctx;

  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', requestId },
      { status: 401 },
    );
  }

  const productId = Number(params.id);
  if (isNaN(productId)) {
    return NextResponse.json(
      { error: 'Invalid ID', requestId },
      { status: 400 },
    );
  }

  const product = await prisma.product.findUnique({
    where: { id: productId, tenantId: user.tenantId },
    include: { category: true, tenant: true, items: true, images: true },
  });

  if (!product) {
    return NextResponse.json(
      { error: 'Product not found', requestId },
      { status: 404 },
    );
  }

  await logActivity(user.id, 'view_product', req, {
    productId,
    latencyMs: latency,
  });

  return NextResponse.json({ product, requestId });
});

// PUT /api/products/[id]
// ADMIN или MANAGER

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

  const productId = Number(params.id);
  if (isNaN(productId)) {
    return NextResponse.json(
      { error: 'Invalid ID', requestId },
      { status: 400 },
    );
  }

  const body = await req.json();
  const parsed = productSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.format(), requestId },
      { status: 400 },
    );
  }

  const { categoryId, slug, ...data } = parsed.data;

  const product = await prisma.product.update({
    where: { id: productId, tenantId: staff.tenantId },
    data: {
      ...data,
      slug: slug ?? slugify(data.name, { lower: true }),
      category: { connect: { id: categoryId } },
    },
  });

  await logActivity(staff.id, 'update_product', req, {
    productId,
    changes: parsed.data,
    latencyMs: latency,
  });

  return NextResponse.json({ product, requestId });
});

// DELETE /api/products/[id]
// Только ADMIN

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

  const productId = Number(params.id);
  if (isNaN(productId)) {
    return NextResponse.json(
      { error: 'Invalid ID', requestId },
      { status: 400 },
    );
  }

  const deleted = await prisma.product.deleteMany({
    where: { id: productId, tenantId: admin.tenantId },
  });

  if (deleted.count === 0) {
    return NextResponse.json(
      { error: 'Product not found', requestId },
      { status: 404 },
    );
  }

  await logActivity(admin.id, 'delete_product', req, {
    productId,
    latencyMs: latency,
  });

  return NextResponse.json({ success: true, requestId });
});
