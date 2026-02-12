'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProductTable } from '@/shared/components';

interface Product {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string | null;
  status: 'ACTIVE' | 'ARCHIVED' | 'DRAFT';
  category: { id: number; name: string } | null;
  items: { id: number; price: number | null }[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data.products || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className='p-6 space-y-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-xl font-bold'>Продукция</h1>

        <Link
          href='/admin/products/create'
          className='px-4 py-2 rounded bg-blue-600 text-white text-sm'>
          Создать продукт
        </Link>
      </div>

      {loading ? (
        <div className='text-sm text-gray-500'>Загрузка...</div>
      ) : (
        <ProductTable products={products} />
      )}
    </div>
  );
}
