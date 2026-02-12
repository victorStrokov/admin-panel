import { NextResponse } from 'next/server';
import { withTracing } from '@/shared/lib/with-tracing';
import { prisma } from '@/prisma/prisma-client';
import { allow } from '@/shared/lib/rbac';
import { verifyCsrf } from '@/shared/lib/verify-csrf';
import { z } from 'zod';

const sortSchema = z.object({
  order: z.array(
    z.object({
      id: z.number(),
      sortOrder: z.number(),
    }),
  ),
});

export const PATCH = withTracing<{ id: string }>(async (req, ctx) => {
  const { requestId, params } = ctx;

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
  const parsed = sortSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.format(), requestId },
      { status: 400 },
    );
  }

  const { order } = parsed.data;

  // Обновляем порядок
  for (const img of order) {
    await prisma.productImage.update({
      where: { id: img.id },
      data: { sortOrder: img.sortOrder },
    });
  }

  return NextResponse.json({ success: true, requestId });
});
