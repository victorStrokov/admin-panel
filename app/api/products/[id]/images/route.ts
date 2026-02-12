import { NextResponse } from 'next/server';
import { withTracing } from '@/shared/lib/with-tracing';
import { prisma } from '@/prisma/prisma-client';
import { getUserFromRequest } from '@/shared/lib/get-user';

export const GET = withTracing<{ id: string }>(async (req, ctx) => {
  const { requestId, params } = ctx;

  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', requestId },
      { status: 401 },
    );
  }

  const productId = Number(params.id);
  if (isNaN(productId)) {
    return NextResponse.json(
      { error: 'Invalid ID', requestId },
      { status: 400 },
    );
  }

  const images = await prisma.productImage.findMany({
    where: { productId, product: { tenantId: user.tenantId } },
    orderBy: { sortOrder: 'asc' },
  });

  return NextResponse.json({ images, requestId });
});
