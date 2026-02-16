import { prisma } from '@/prisma/prisma-client';
import { ProductImages } from '@/shared/components';
import { ProductForm } from '@/shared/components/shared/product-form';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductPage(props: Props) {
  const params = await props.params;
  const productId = Number(params.id);

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      category: true,
      items: true,
      images: true,
    },
  });

  if (!product) {
    return <div className='p-6'>Товар не найден</div>;
  }

  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
  });

  async function handleProductSubmit({
    name,
    categoryId,
    shortDesc,
    fullDesc,
    status,
  }: {
    name: string;
    categoryId: number;
    shortDesc?: string;
    fullDesc?: string;
    status: 'ACTIVE' | 'ARCHIVED' | 'DRAFT';
  }) {
    'use server';

    await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        categoryId,
        shortDesc,
        fullDesc,
        status,
        updatedAt: new Date(),
      },
    });
  }

  return (
    <div className='p-6 space-y-6'>
      <h1 className='text-2xl font-bold'>Редактирование товара</h1>

      <ProductForm
        onSubmit={handleProductSubmit}
        initialData={{
          name: product.name,
          categoryId: product.categoryId,
          shortDesc: product.shortDesc ?? '',
          fullDesc: product.fullDesc ?? '',
          status: product.status,
        }}
        categories={categories}
      />

      <ProductImages product={product} />
    </div>
  );
}
