import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';

interface Params {
  params: { id: string };
}

// GET /api/products/[id]
export async function GET(_: Request, { params }: Params) {
  const product = await prisma.product.findUnique({
    where: { id: Number(params.id) },
    include: { category: true },
  });
  return NextResponse.json(product);
}

// PUT /api/products/[id]
export async function PUT(req: Request, { params }: Params) {
  const body = await req.json();
  const product = await prisma.product.update({
    where: { id: Number(params.id) },
    data: body,
  });
  return NextResponse.json(product);
}

// DELETE /api/products/[id]
export async function DELETE(_: Request, { params }: Params) {
  await prisma.product.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ success: true });
}
