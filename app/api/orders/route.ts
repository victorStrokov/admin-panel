import { NextResponse } from 'next/server';
import { withTracing } from '@/shared/lib/with-tracing';
import { prisma } from '@/prisma/prisma-client';
import { getUserFromRequest } from '@/shared/lib/get-user';
import { allow } from '@/shared/lib/rbac';
import { logActivity } from '@/shared/lib/log-activity';
import {
  orderCreateSchema,
  orderUpdateSchema,
} from '@/shared/lib/validation/order.schema';
import { verifyCsrf } from '@/shared/lib/verify-csrf';
import { limiter } from '@/shared/lib/rate-limit';
import { logInventoryChange } from '@/shared/lib/log-inventory';

//  GET /api/orders
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

  const orders = await prisma.order.findMany({
    where: { tenantId: user.tenantId },
    include: { user: true, tenant: true },
    orderBy: { createdAt: 'desc' },
  });

  await logActivity(user.id, 'view_orders', req, {
    count: orders.length,
    latencyMs: latency,
  });

  return NextResponse.json({ orders, requestId });
});

// POST /api/orders
// Доступно всем авторизованным пользователям

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

  const csrfError = verifyCsrf(req);
  if (csrfError) return csrfError;

  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', requestId },
      { status: 401 },
    );
  }

  const body = await req.json();
  const parsed = orderCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues, requestId },
      { status: 400 },
    );
  }

  // 1) Проверяем остатки ДО создания заказа
  for (const item of parsed.data.items) {
    const inv = await prisma.inventory.findFirst({
      where: { productItemId: item.productItemId, tenantId: user.tenantId },
    });

    if (!inv || inv.quantity < item.quantity) {
      return NextResponse.json(
        { error: `Not enough stock for item ${item.productItemId}`, requestId },
        { status: 400 },
      );
    }
  }

  const order = await prisma.order.create({
    data: {
      ...parsed.data,
      userId: user.id,
      tenantId: user.tenantId,
    },
  });

  // 3) Списываем остатки + логируем изменения
  for (const item of parsed.data.items) {
    const inv = await prisma.inventory.findFirst({
      where: { productItemId: item.productItemId, tenantId: user.tenantId },
    });

    if (!inv) continue;

    const oldQuantity = inv.quantity;
    const newQuantity = inv.quantity - item.quantity;

    await prisma.inventory.update({
      where: { productItemId: item.productItemId },
      data: { quantity: { decrement: item.quantity } },
    });

    await logInventoryChange({
      inventoryId: inv.id,
      productItemId: inv.productItemId,
      tenantId: user.tenantId,
      userId: user.id,
      oldQuantity,
      newQuantity,
      reason: 'order_created',
      requestId,
    });
  }

  await logActivity(user.id, 'create_order', req, {
    orderId: order.id,
    latencyMs: latency,
  });

  return NextResponse.json({ order, requestId });
});

// PUT /api/orders
// Только ADMIN или MANAGER

export const PUT = withTracing(async (req, ctx) => {
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

  const csrfError = verifyCsrf(req);
  if (csrfError) return csrfError;

  const staff = await allow.staff(req);
  if (!staff) {
    return NextResponse.json(
      { error: 'Forbidden', requestId },
      { status: 403 },
    );
  }

  const body = await req.json();
  const parsed = orderUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues, requestId },
      { status: 400 },
    );
  }

  const { id, status, totalAmount } = parsed.data;

  const existing = await prisma.order.findFirst({
    where: { id, tenantId: staff.tenantId },
  });

  if (!existing) {
    return NextResponse.json(
      { error: 'Order not found', requestId },
      { status: 404 },
    );
  }

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: { status, totalAmount },
  });

  if (status === 'CANCELLED') {
    const items = Array.isArray(existing.items)
      ? (existing.items as Array<{ productItemId: number; quantity: number }>)
      : [];

    for (const item of items) {
      // 1) Получаем текущее состояние инвентаря
      const inv = await prisma.inventory.findFirst({
        where: { productItemId: item.productItemId, tenantId: staff.tenantId },
      });

      if (!inv) continue;

      const oldQuantity = inv.quantity;
      const newQuantity = inv.quantity + item.quantity;

      // 2) Обновляем остаток
      await prisma.inventory.update({
        where: { productItemId: item.productItemId },
        data: { quantity: { increment: item.quantity } },
      });

      // 3) Логируем изменение
      await logInventoryChange({
        inventoryId: inv.id,
        productItemId: inv.productItemId,
        tenantId: staff.tenantId,
        userId: staff.id,
        oldQuantity,
        newQuantity,
        reason: 'order_cancelled',
        requestId,
      });
    }
  }

  await logActivity(staff.id, 'update_order', req, {
    orderId: id,
    latencyMs: latency,
  });

  return NextResponse.json({ order: updatedOrder, requestId });
});

// DELETE /api/orders?id=123
// Только ADMIN

export const DELETE = withTracing(async (req, ctx) => {
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
  const idParam = searchParams.get('id');
  const id = idParam ? Number(idParam) : NaN;

  if (!id || Number.isNaN(id)) {
    return NextResponse.json(
      { error: 'Invalid id', requestId },
      { status: 400 },
    );
  }

  const existing = await prisma.order.findFirst({
    where: { id, tenantId: admin.tenantId },
  });

  if (!existing) {
    return NextResponse.json(
      { error: 'Order not found', requestId },
      { status: 404 },
    );
  }

  await prisma.order.delete({ where: { id } });

  const items = Array.isArray(existing.items)
    ? (existing.items as Array<{ productItemId: number; quantity: number }>)
    : [];

  for (const item of items) {
    // 1) Получаем старое состояние инвентаря
    const inv = await prisma.inventory.findFirst({
      where: { productItemId: item.productItemId, tenantId: admin.tenantId },
    });

    if (!inv) continue;

    const oldQuantity = inv.quantity;
    const newQuantity = inv.quantity + item.quantity;

    // 2) Обновляем остаток
    await prisma.inventory.update({
      where: { productItemId: item.productItemId },
      data: { quantity: { increment: item.quantity } },
    });

    // 3) Логируем изменение
    await logInventoryChange({
      inventoryId: inv.id,
      productItemId: inv.productItemId,
      tenantId: admin.tenantId,
      userId: admin.id,
      oldQuantity,
      newQuantity,
      reason: 'order_deleted',
      requestId,
    });
  }

  await logActivity(admin.id, 'delete_order', req, {
    orderId: id,
    latencyMs: latency,
  });

  return NextResponse.json({ success: true, requestId });
});
