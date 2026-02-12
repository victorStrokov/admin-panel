import { NextResponse } from 'next/server';
import { withTracing } from '@/shared/lib/with-tracing';
import { prisma } from '@/prisma/prisma-client';
import { allow } from '@/shared/lib/rbac';
import { verifyCsrf } from '@/shared/lib/verify-csrf';
import { logActivity } from '@/shared/lib/log-activity';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';

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

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const productId = Number(formData.get('productId'));

  if (!file) {
    return NextResponse.json(
      { error: 'File is required', requestId },
      { status: 400 },
    );
  }

  if (!productId || isNaN(productId)) {
    return NextResponse.json(
      { error: 'Invalid productId', requestId },
      { status: 400 },
    );
  }

  // Проверяем, что продукт принадлежит этому tenant
  const product = await prisma.product.findFirst({
    where: { id: productId, tenantId: staff.tenantId },
  });

  if (!product) {
    return NextResponse.json(
      { error: 'Product not found', requestId },
      { status: 404 },
    );
  }

  // Создаём директорию, если нет
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Генерируем имя файла
  const ext = file.name.split('.').pop();
  const filename = `${randomUUID()}.${ext}`;
  const filepath = path.join(uploadDir, filename);

  // Сохраняем файл
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filepath, buffer);

  const url = `/uploads/products/${filename}`;

  // Создаём запись в ProductImage
  const image = await prisma.productImage.create({
    data: {
      productId,
      url,
      sortOrder: 0,
    },
  });

  await logActivity(staff.id, 'upload_product_image', req, {
    productId,
    imageId: image.id,
    latencyMs: latency,
  });

  return NextResponse.json(
    {
      image: {
        id: image.id,
        url: image.url,
      },
      requestId,
    },
    { status: 200 },
  );
});
