import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';

// GET /api/products → список
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Ошибка при загрузке товаров:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// POST /api/products → создание
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const product = await prisma.product.create({ data: body });
    return NextResponse.json(product);
  } catch (error) {
    console.error('Ошибка при создании товара:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
