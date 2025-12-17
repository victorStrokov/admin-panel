import Link from 'next/link';
import { prisma } from '@/prisma/prisma-client';

export default async function ProductsPage() {
  let products = [];
  try {
    products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Ошибка при загрузке списка товаров:', error);
    return <div className='p-6 text-red-600'>Ошибка загрузки списка</div>;
  }

  if (!products.length) {
    return <div className='p-6'>Товаров пока нет</div>;
  }

  return (
    <div className='p-6 space-y-6'>
      <h1 className='text-2xl font-bold'>Список товаров</h1>
      <Link
        href='/products/create'
        className='inline-block bg-blue-600 text-white px-4 py-2 rounded'>
        + Добавить товар
      </Link>

      <ul className='space-y-4'>
        {products.map((product) => (
          <li
            key={product.id}
            className='flex items-center justify-between border p-4 rounded'>
            <div>
              <p className='font-semibold'>{product.name}</p>
              <p className='text-sm text-gray-500'>
                Категория: {product.category?.name || '—'}
              </p>
            </div>
            <div className='flex gap-2'>
              <Link
                href={`/products/${product.id}`}
                className='bg-yellow-500 text-white px-3 py-1 rounded'>
                Редактировать
              </Link>
              <form
                action={async () => {
                  'use server';
                  try {
                    await prisma.product.delete({ where: { id: product.id } });
                    console.log(`Товар #${product.id} удалён`);
                  } catch (error) {
                    console.error(
                      `Ошибка при удалении товара #${product.id}:`,
                      error
                    );
                  }
                }}>
                <button
                  type='submit'
                  className='bg-red-600 text-white px-3 py-1 rounded'>
                  Удалить
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
