import { z } from 'zod';
import { prisma } from '@/prisma/prisma-client';
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/shared/lib/get-user';
import { logActivity } from '@/shared/lib/log-activity';
import { Prisma } from '@prisma/client';

// Валидация Order
const orderSchema = z.object({
  status: z.enum(['PENDING', 'SUCCEEDED', 'CANCELLED']),
  totalAmount: z.number().positive(),
});

// =========================
// GET /api/orders
// =========================
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.format() },
        { status: 400 }
      );
    }

    const order = await prisma.order.create({
      data: {
        ...(parsed.data as unknown as Prisma.OrderUncheckedCreateInput),
        userId: user.id,
        tenantId: user.tenantId,
      } as Prisma.OrderUncheckedCreateInput,
    });

    await logActivity(user.id, 'create_order', req);

    return NextResponse.json(order);
  } catch (error) {
    console.error('[ORDERS_POST]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// =========================
// PUT /api/orders/:id
// =========================
export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = orderSchema.extend({ id: z.number() }).safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.format() },
        { status: 400 }
      );
    }

    const { id, status, totalAmount } = parsed.data;

    const updatedOrder = await prisma.order.updateMany({
      where: { id, tenantId: user.tenantId },
      data: {
        status: { set: status },
        totalAmount: { set: totalAmount },
      },
    });

    if (updatedOrder.count === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    await logActivity(user.id, 'update_order', req);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ORDERS_PUT]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
