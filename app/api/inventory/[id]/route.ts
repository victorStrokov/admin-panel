import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';
import { withTracing } from '@/shared/lib/with-tracing';
import { limiter } from '@/shared/lib/rate-limit';
import { allow } from '@/shared/lib/rbac';
import { logActivity } from '@/shared/lib/log-activity';
import { logInventoryChange } from '@/shared/lib/log-inventory';

export const PATCH = withTracing<{ id: string }>(async (req, ctx) => {
  const { requestId, params, latency } = ctx;

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

  // ADMIN + MANAGER
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

  const { quantity } = await req.json();

  const existing = await prisma.inventory.findFirst({
    where: { id, tenantId: staff.tenantId },
  });

  if (!existing) {
    return NextResponse.json(
      { error: 'Inventory item not found', requestId },
      { status: 404 },
    );
  }
  const oldQuantity = existing.quantity;

  const updated = await prisma.inventory.update({
    where: { id },
    data: { quantity },
  });

  await logActivity(staff.id, 'update_inventory_item', req, {
    inventoryId: id,
    newQuantity: quantity,
    latencyMs: latency,
  });
  await logInventoryChange({
    inventoryId: id,
    productItemId: existing.productItemId,
    tenantId: staff.tenantId,
    userId: staff.id,
    oldQuantity,
    newQuantity: quantity,
    reason: 'manual_update',
    requestId,
  });

  return NextResponse.json({ updated, requestId });
});

export const DELETE = withTracing<{ id: string }>(async (req, ctx) => {
  const { requestId, params, latency } = ctx;

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

  // ADMIN + MANAGER
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

  const existing = await prisma.inventory.findFirst({
    where: { id, tenantId: staff.tenantId },
  });

  if (!existing) {
    return NextResponse.json(
      { error: 'Inventory item not found', requestId },
      { status: 404 },
    );
  }

  await prisma.inventory.delete({
    where: { id },
  });

  await logActivity(staff.id, 'delete_inventory_item', req, {
    inventoryId: id,
    latencyMs: latency,
  });
  await logInventoryChange({
    inventoryId: id,
    productItemId: existing.productItemId,
    tenantId: staff.tenantId,
    userId: staff.id,
    oldQuantity: existing.quantity,
    newQuantity: 0,
    reason: 'inventory_deleted',
    requestId,
  });

  return NextResponse.json({ success: true, requestId });
});
