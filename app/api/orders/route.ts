import { prisma } from '@/prisma/prisma-client';
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/shared/lib/get-user';
import { logActivity } from '@/shared/lib/log-activity';
import {
  orderCreateSchema,
  orderUpdateSchema,
} from '@/shared/lib/validation/order.schema';

// =========================
// GET /api/orders
// =========================
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { tenantId: user.tenantId },
      include: { user: true, tenant: true },
      orderBy: { createdAt: 'desc' },
    });

    await logActivity(user.id, 'view_orders', req);

    return NextResponse.json(orders);
  } catch (error) {
    console.error('[ORDERS_GET]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// =========================
// POST /api/orders
// =========================
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = orderCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const order = await prisma.order.create({
      data: {
        status: parsed.data.status,
        totalAmount: parsed.data.totalAmount,
        token: parsed.data.token,
        items: parsed.data.items, // Json
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        address: parsed.data.address,
        comment: parsed.data.comment,
        paymentId: parsed.data.paymentId,
        userId: user.id,
        tenantId: user.tenantId,
      },
    });

    await logActivity(user.id, 'create_order', req);

    return NextResponse.json(order);
  } catch (error) {
    console.error('[ORDERS_POST]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// =========================
// PUT /api/orders
// =========================
export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = orderUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const { id, status, totalAmount } = parsed.data;

    const existing = await prisma.order.findFirst({
      where: { id, tenantId: user.tenantId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status, totalAmount },
    });

    await logActivity(user.id, 'update_order', req);

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('[ORDERS_PUT]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// =========================
// DELETE /api/orders?id=123
// =========================
export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const existing = await prisma.order.findFirst({
      where: { id, tenantId: user.tenantId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    await prisma.order.delete({ where: { id } });

    await logActivity(user.id, 'delete_order', req);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ORDERS_DELETE]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
