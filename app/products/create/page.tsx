import { ProductForm } from '@/shared/components/shared/product-form';
import { prisma } from '@/prisma/prisma-client';

export default async function CreateProductPage() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
  });

  async function handleCreate(data: {
    name: string;
    categoryId: number;
    shortDesc?: string;
    fullDesc?: string;
    status: 'ACTIVE' | 'ARCHIVED' | 'DRAFT';
  }) {
    'use server';

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
    );

    if (!res.ok) {
      console.error('Ошибка создания товара', await res.json());
      throw new Error('Не удалось создать товар');
    }

    console.log('Товар успешно создан');
  }

  return (
    <div className='p-6 space-y-6'>
      <h1 className='text-2xl font-bold'>Создание товара</h1>

      <ProductForm
        onSubmit={handleCreate}
        categories={categories}
      />
    </div>
  );
}
