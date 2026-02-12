import { NextResponse } from 'next/server';
import { withTracing } from '@/shared/lib/with-tracing';
import { prisma } from '@/prisma/prisma-client';
import { allow } from '@/shared/lib/rbac';
import { verifyCsrf } from '@/shared/lib/verify-csrf';
import { logActivity } from '@/shared/lib/log-activity';
import { productItemSchema } from './schema';
import { generateSku } from '@/shared/lib/generate-sku';

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
  const parsed = productItemSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.format(), requestId },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // Проверяем, что продукт принадлежит tenant
  const product = await prisma.product.findFirst({
    where: { id: data.productId, tenantId: staff.tenantId },
  });

  if (!product) {
    return NextResponse.json(
      { error: 'Product not found', requestId },
      { status: 404 },
    );
  }

  const item = await prisma.productItem.create({
    data: {
      ...data,
      sku: generateSku('ITEM'),
      inventory: {
        create: {
          quantity: 0,
          tenantId: staff.tenantId,
        },
      },
    },
    include: {
      inventory: true,
    },
  });

  await logActivity(staff.id, 'create_product_item', req, {
    productItemId: item.id,
    productId: data.productId,
    latencyMs: latency,
  });

  return NextResponse.json({ item, requestId });
});
