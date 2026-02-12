import { NextResponse } from 'next/server';
import { withTracing } from '@/shared/lib/with-tracing';
import { prisma } from '@/prisma/prisma-client';
import { allow } from '@/shared/lib/rbac';
import { verifyCsrf } from '@/shared/lib/verify-csrf';
import { logActivity } from '@/shared/lib/log-activity';
import { productItemSchema } from '../schema';

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
  const parsed = productItemSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.format(), requestId },
      { status: 400 },
    );
  }

  const data = parsed.data;

  const item = await prisma.productItem.update({
    where: { id },
    data,
    include: { inventory: true },
  });

  await logActivity(staff.id, 'update_product_item', req, {
    productItemId: id,
    latencyMs: latency,
  });

  return NextResponse.json({ item, requestId });
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

  // Удаляем inventory
  await prisma.inventory.deleteMany({
    where: { productItemId: id },
  });

  // Удаляем сам item
  const deleted = await prisma.productItem.deleteMany({
    where: { id },
  });

  if (deleted.count === 0) {
    return NextResponse.json(
      { error: 'ProductItem not found', requestId },
      { status: 404 },
    );
  }

  await logActivity(admin.id, 'delete_product_item', req, {
    productItemId: id,
    latencyMs: latency,
  });

  return NextResponse.json({ success: true, requestId });
});
