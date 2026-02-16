import { z } from 'zod';
import { prisma } from '@/prisma/prisma-client';
import { NextResponse } from 'next/server';
import { withTracing } from '@/shared/lib/with-tracing';
import { getUserFromRequest } from '@/shared/lib/get-user';
import { allow } from '@/shared/lib/rbac';
import { logActivity } from '@/shared/lib/log-activity';
import { verifyCsrf } from '@/shared/lib/verify-csrf';
import slugify from 'slugify';
import fs from 'fs';
import path from 'path';
import { Prisma } from '@prisma/client';

// Валидация Product
const productSchema = z.object({
  name: z.string().min(2, 'Название должно быть не короче 2 символов'),
  tempImageUrl: z.string().optional(),
  slug: z.string().optional().nullable(),
  shortDesc: z.string().optional(),
  fullDesc: z.string().optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED', 'DRAFT']).default('ACTIVE'),
  categoryId: z.number(),
});

// ---------------- GET /api/products ----------------
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

  const products = await prisma.product.findMany({
    where: { tenantId: user.tenantId },
    include: {
      category: true,
      tenant: true,
      items: {
        select: {
          id: true,
          price: true,
        },
      },
      images: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  await logActivity(user.id, 'view_products', req, {
    count: products.length,
    latencyMs: latency,
  });

  return NextResponse.json({ products, requestId });
});

// ---------------- POST /api/products ----------------
// ADMIN или MANAGER

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
  const parsed = productSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.format(), requestId },
      { status: 400 },
    );
  }

  const { categoryId, slug, tempImageUrl, ...data } = parsed.data;

  let product;

  try {
    product = await prisma.product.create({
      data: {
        ...data,
        slug: slug ?? slugify(data.name, { lower: true }),
        category: { connect: { id: categoryId } },
        tenant: { connect: { id: staff.tenantId } },
      },
      include: { category: true, tenant: true, images: true },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      const target = err.meta?.target as string[] | undefined;

      if (err.code === 'P2002' && target?.includes('slug')) {
        return NextResponse.json(
          {
            error: {
              slug: ['Такой slug уже существует'],
            },
            requestId,
          },
          { status: 400 },
        );
      }
    }

    console.error('Unhandled error:', err);

    return NextResponse.json(
      { error: 'Internal server error', requestId },
      { status: 500 },
    );
  }

  // --- Перенос изображения из temp в products ---
  if (tempImageUrl) {
    const tempPath = path.join(process.cwd(), 'public', tempImageUrl);

    const finalDir = path.join(process.cwd(), 'public', 'uploads', 'products');

    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true });
    }

    let finalPath = path.join(finalDir, path.basename(tempImageUrl));

    // Если файл уже существует — создаём уникальное имя
    if (fs.existsSync(finalPath)) {
      const ext = path.extname(finalPath);
      const base = path.basename(finalPath, ext);
      finalPath = path.join(finalDir, `${base}-${Date.now()}${ext}`);
    }

    fs.renameSync(tempPath, finalPath);

    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: `/uploads/products/${path.basename(finalPath)}`,
        sortOrder: 0,
      },
    });
  }

  const fullProduct = await prisma.product.findUnique({
    where: { id: product.id },
    include: { category: true, tenant: true, images: true },
  });

  await logActivity(staff.id, 'create_product', req, {
    productId: product.id,
    latencyMs: latency,
  });

  return NextResponse.json({ product: fullProduct, requestId });
});

// ---------------- PUT /api/products ----------------
// Только ADMIN или MANAGER
const updateProductSchema = productSchema
  .omit({ tempImageUrl: true })
  .extend({ id: z.number() });
export const PUT = withTracing(async (req, ctx) => {
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
  const parsed = updateProductSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.format(), requestId },
      { status: 400 },
    );
  }

  const { id, categoryId, slug, ...data } = parsed.data;

  const product = await prisma.product.update({
    where: { id, tenantId: staff.tenantId },
    data: {
      ...data,
      slug: slug ?? slugify(data.name, { lower: true }),
      category: { connect: { id: categoryId } },
    },
    include: { category: true, tenant: true, images: true },
  });

  const fullProduct = await prisma.product.findUnique({
    where: { id: product.id },
    include: { category: true, tenant: true, images: true },
  });

  await logActivity(staff.id, 'update_product', req, {
    productId: id,
    latencyMs: latency,
  });

  return NextResponse.json({ product: fullProduct, requestId });
});

// Только ADMIN
// DELETE /api/products
export const DELETE = withTracing(async (req, ctx) => {
  const { requestId, latency } = ctx;

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
  const id = Number(searchParams.get('id'));

  if (!id) {
    return NextResponse.json(
      { error: 'Product ID required', requestId },
      { status: 400 },
    );
  }

  //  Загружаем все изображения товара
  const images = await prisma.productImage.findMany({
    where: { productId: id, product: { tenantId: admin.tenantId } },
  });

  //  Удаляем файлы с диска
  for (const img of images) {
    const filePath = path.join(process.cwd(), 'public', img.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  //  Удаляем записи изображений из базы
  await prisma.productImage.deleteMany({
    where: { productId: id },
  });

  // Удаляем сам продукт
  const deleted = await prisma.product.deleteMany({
    where: { id, tenantId: admin.tenantId },
  });

  if (deleted.count === 0) {
    return NextResponse.json(
      { error: 'Product not found', requestId },
      { status: 404 },
    );
  }

  await logActivity(admin.id, 'delete_product', req, {
    productId: id,
    latencyMs: latency,
  });

  return NextResponse.json({ success: true, requestId });
});
