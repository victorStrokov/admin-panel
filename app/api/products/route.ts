import { z } from 'zod';
import { prisma } from '@/prisma/prisma-client';
import { NextResponse } from 'next/server';
import { withTracing } from '@/shared/lib/with-tracing';
import { getUserFromRequest } from '@/shared/lib/get-user';
import { allow } from '@/shared/lib/rbac';
import { logActivity } from '@/shared/lib/log-activity';
import { verifyCsrf } from '@/shared/lib/verify-csrf';

// Валидация Product
const productSchema = z.object({
  name: z.string().min(2, 'Название должно быть не короче 2 символов'),
  imageUrl: z.string().url('Некорректный URL изображения'),
  price: z.number().positive('Цена должна быть положительным числом'),
  categoryId: z.number(),
});

// ---------------- GET /api/products ----------------
// Доступно всем авторизованным пользователям

export const GET = withTracing(async (req, ctx) => {
  const { requestId, latency } = ctx;

  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', requestId },
      { status: 401 },
    );
  }

  const products = await prisma.product.findMany({
    where: { tenantId: user.tenantId },
    include: { category: true, tenant: true },
    orderBy: { createdAt: 'desc' },
  });

  await logActivity(user.id, 'view_products', req, {
    count: products.length,
    latencyMs: latency,
  });

  return NextResponse.json({ products, requestId });
});

// ---------------- POST /api/products ----------------
// ADMIN или MANAGER

export const POST = withTracing(async (req, ctx) => {
  const { requestId, latency } = ctx;

  const csrfError = verifyCsrf(req);
  if (csrfError) return csrfError;

  const staff = await allow.manageProducts(req);
  if (!staff) {
    return NextResponse.json(
      { error: 'Forbidden', requestId },
      { status: 403 },
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

  const { categoryId, ...data } = parsed.data;

  const product = await prisma.product.create({
    data: {
      ...data,
      category: { connect: { id: categoryId } },
      tenant: { connect: { id: staff.tenantId } },
    },
    include: { category: true, tenant: true },
  });

  await logActivity(staff.id, 'create_product', req, {
    productId: product.id,
    latencyMs: latency,
  });

  return NextResponse.json({ product, requestId });
});

// ---------------- PUT /api/products ----------------
// Только ADMIN или MANAGER

export const PUT = withTracing(async (req, ctx) => {
  const { requestId, latency } = ctx;

  const csrfError = verifyCsrf(req);
  if (csrfError) return csrfError;

  const staff = await allow.manageProducts(req);
  if (!staff) {
    return NextResponse.json(
      { error: 'Forbidden', requestId },
      { status: 403 },
    );
  }

  const body = await req.json();
  const parsed = productSchema.extend({ id: z.number() }).safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.format(), requestId },
      { status: 400 },
    );
  }

  const { id, categoryId, ...data } = parsed.data;

  const product = await prisma.product.update({
    where: { id, tenantId: staff.tenantId },
    data: {
      ...data,
      category: { connect: { id: categoryId } },
    },
    include: { category: true, tenant: true },
  });

  await logActivity(staff.id, 'update_product', req, {
    productId: id,
    latencyMs: latency,
  });

  return NextResponse.json({ product, requestId });
});

// ---------------- DELETE /api/products ----------------
// Только ADMIN

export const DELETE = withTracing(async (req, ctx) => {
  const { requestId, latency } = ctx;

  const csrfError = verifyCsrf(req);
  if (csrfError) return csrfError;

  const admin = await allow.admin(req);
  if (!admin) {
    return NextResponse.json(
      { error: 'Forbidden', requestId },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get('id'));

  if (!id) {
    return NextResponse.json(
      { error: 'Product ID required', requestId },
      { status: 400 },
    );
  }

  const deleted = await prisma.product.deleteMany({
    where: { id, tenantId: admin.tenantId },
  });

  if (deleted.count === 0) {
    return NextResponse.json(
      { error: 'Product not found', requestId },
      { status: 404 },
    );
  }

  await logActivity(admin.id, 'delete_product', req, {
    productId: id,
    latencyMs: latency,
  });

  return NextResponse.json({ success: true, requestId });
});
