import { prisma } from '@/prisma/prisma-client';
import { Prisma } from '@prisma/client';
import { ProductForm } from '@/shared/components/shared/product-form';

export default function CreateProductPage() {
  async function handleCreate(data: {
    name: string;
    imageUrl: string;
    categoryId: number;
  }) {
    'use server'; // Next.js 15 server action
    await prisma.product.create({
      data: {
        name: data.name,
        imageUrl: data.imageUrl,
        categoryId: data.categoryId,
      } as Prisma.ProductUncheckedCreateInput,
    });
    console.log('Товар успешно создан');
  }

  return (
    <div className='p-6 space-y-6'>
      <h1 className='text-2xl font-bold'>Создание товара</h1>
      <ProductForm onSubmit={handleCreate} />
    </div>
  );
}
