import { z } from 'zod';
import { prisma } from '@/prisma/prisma-client';
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/shared/lib/get-user';
import { logActivity } from '@/shared/lib/log-activity';

// =========================
// Валидация Product
// =========================
const productSchema = z.object({
  name: z.string().min(2, 'Название должно быть не короче 2 символов'),
  imageUrl: z.string().url('Некорректный URL изображения'),
  price: z.number().positive('Цена должна быть положительным числом'),
  categoryId: z.number(),
});

// =========================
// GET /api/products
// =========================
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const products = await prisma.product.findMany({
      where: { tenantId: user.tenantId },
      include: { category: true, tenant: true },
      orderBy: { createdAt: 'desc' },
    });

    await logActivity(user.id, 'view_products', req);

    return NextResponse.json(products);
  } catch (error) {
    console.error('[PRODUCTS_GET]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// =========================
// POST /api/products
// =========================
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.format() },
        { status: 400 }
      );
    }

    const { categoryId, ...data } = parsed.data;

    const product = await prisma.product.create({
      data: {
        ...data,
        category: { connect: { id: categoryId } },
        tenant: { connect: { id: user.tenantId } },
      },
      include: { category: true, tenant: true },
    });

    await logActivity(user.id, 'create_product', req);

    return NextResponse.json(product);
  } catch (error) {
    console.error('[PRODUCTS_POST]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// =========================
// PUT /api/products/:id
// =========================
// =========================
// PUT /api/products/:id
// =========================
export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = productSchema.extend({ id: z.number() }).safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.format() },
        { status: 400 }
      );
    }

    const { id, categoryId, ...data } = parsed.data;

    const product = await prisma.product.update({
      where: { id, tenantId: user.tenantId },
      data: {
        ...data,
        category: { connect: { id: categoryId } },
      },
      include: { category: true, tenant: true },
    });

    await logActivity(user.id, 'update_product', req);

    return NextResponse.json(product);
  } catch (error) {
    console.error('[PRODUCTS_PUT]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// =========================
// DELETE /api/products/:id
// =========================
export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get('id'));

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID required' },
        { status: 400 }
      );
    }

    const deleted = await prisma.product.deleteMany({
      where: { id, tenantId: user.tenantId },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await logActivity(user.id, 'delete_product', req);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PRODUCTS_DELETE]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
