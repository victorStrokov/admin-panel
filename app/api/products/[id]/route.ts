import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';
import { getUserFromRequest } from '@/shared/lib/get-user';
import { logActivity } from '@/shared/lib/log-activity';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(2),
  imageUrl: z.string().url(),
  price: z.number().positive(),
  categoryId: z.number(),
});

// =========================
// GET /api/products/[id]
// =========================
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await props.params;
    const productId = Number(id);
    if (isNaN(productId))
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const product = await prisma.product.findUnique({
      where: { id: productId, tenantId: user.tenantId },
      include: { category: true, tenant: true },
    });

    if (!product)
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    await logActivity(user.id, 'view_product', req);

    return NextResponse.json(product);
  } catch (e) {
    console.error('[PRODUCT_GET]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// =========================
// PUT /api/products/[id]
// =========================
export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await props.params;
    const productId = Number(id);
    if (isNaN(productId))
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.format() },
        { status: 400 }
      );
    }

    const { categoryId, ...data } = parsed.data;

    const product = await prisma.product.update({
      where: { id: productId, tenantId: user.tenantId },
      data: {
        ...data,
        category: { connect: { id: categoryId } },
      },
      include: { category: true, tenant: true },
    });

    await logActivity(user.id, 'update_product', req);

    return NextResponse.json(product);
  } catch (e) {
    console.error('[PRODUCT_PUT]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// =========================
// DELETE /api/products/[id]
// =========================
export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await props.params;
    const productId = Number(id);
    if (isNaN(productId))
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const deleted = await prisma.product.deleteMany({
      where: { id: productId, tenantId: user.tenantId },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await logActivity(user.id, 'delete_product', req);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[PRODUCT_DELETE]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
