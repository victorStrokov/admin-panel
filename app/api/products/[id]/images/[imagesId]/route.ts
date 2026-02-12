import { NextResponse } from 'next/server';
import { withTracing } from '@/shared/lib/with-tracing';
import { prisma } from '@/prisma/prisma-client';
import { allow } from '@/shared/lib/rbac';
import { verifyCsrf } from '@/shared/lib/verify-csrf';
import { logActivity } from '@/shared/lib/log-activity';
import fs from 'fs';
import path from 'path';

export const DELETE = withTracing<{ id: string; imageId: string }>(
  async (req, ctx) => {
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

    const productId = Number(params.id);
    const imageId = Number(params.imageId);

    if (isNaN(productId) || isNaN(imageId)) {
      return NextResponse.json(
        { error: 'Invalid ID', requestId },
        { status: 400 },
      );
    }

    const image = await prisma.productImage.findFirst({
      where: { id: imageId, productId, product: { tenantId: staff.tenantId } },
    });

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found', requestId },
        { status: 404 },
      );
    }

    // Удаляем файл из public
    const filePath = path.join(process.cwd(), 'public', image.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.productImage.delete({ where: { id: imageId } });

    await logActivity(staff.id, 'delete_product_image', req, {
      productId,
      imageId,
      latencyMs: latency,
    });

    return NextResponse.json({ success: true, requestId });
  },
);
