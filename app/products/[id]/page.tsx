import { prisma } from '@/prisma/prisma-client';
import { ProductForm } from '@/shared/components/shared/product-form';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductPage(props: Props) {
  const params = await props.params;
  const { id } = params;
  const productId = Number(id);

  let product = null;
  try {
    // Загружаем товар из базы
    product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true, items: true },
    });
  } catch (error) {
    console.error('Ошибка при загрузке товара:', error);
    return <div className='p-6 text-red-600'>Ошибка загрузки товара</div>;
  }

  if (!product) {
    return <div className='p-6'>Товар не найден</div>;
  }

  // Обработчик сохранения (через API)
  async function handleProductSubmit({
    name,
    imageUrl,
    categoryId,
  }: {
    name: string;
    imageUrl: string;
    categoryId: number;
  }) {
    'use server'; // Next.js 15 server action
    try {
      await prisma.product.update({
        where: { id: productId },
        data: {
          name: name,
          imageUrl: imageUrl,
          categoryId: categoryId,
          updatedAt: new Date(),
        },
      });
      console.log(`Товар #${productId} успешно обновлён`);
    } catch (error) {
      console.error(`Ошибка при обновлении товара #${productId}:`, error);
      throw new Error('Не удалось обновить товар');
    }
  }

  return (
    <div className='p-6 space-y-6'>
      <h1 className='text-2xl font-bold'>Редактирование товара</h1>
      <ProductForm
        onSubmit={handleProductSubmit}
        initialData={{
          name: product.name,
          imageUrl: product.imageUrl,
          categoryId: product.categoryId,
        }}
      />
    </div>
  );
}
