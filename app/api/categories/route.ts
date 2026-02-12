import { NextResponse } from 'next/server';
import { withTracing } from '@/shared/lib/with-tracing';
import { prisma } from '@/prisma/prisma-client';
import { getUserFromRequest } from '@/shared/lib/get-user';
import { allow } from '@/shared/lib/rbac';
import { verifyCsrf } from '@/shared/lib/verify-csrf';
import { logActivity } from '@/shared/lib/log-activity';

import { z } from 'zod';
import slugify from 'slugify';

const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  parentId: z.number().optional(),
});

export const GET = withTracing(async (req, ctx) => {
  const { requestId } = ctx;

  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', requestId },
      { status: 401 },
    );
  }

  const categories = await prisma.category.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ categories, requestId });
});

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
  const parsed = categorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.format(), requestId },
      { status: 400 },
    );
  }

  const { name, slug, parentId } = parsed.data;

  const category = await prisma.category.create({
    data: {
      name,
      slug: slug ?? slugify(name, { lower: true }),
      tenantId: staff.tenantId,
      parentId: parentId ?? null,
    },
  });

  await logActivity(staff.id, 'create_category', req, {
    categoryId: category.id,
    latencyMs: latency,
  });

  return NextResponse.json({ category, requestId });
});
