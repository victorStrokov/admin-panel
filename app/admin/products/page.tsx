'use client';

import { ProductTable } from '@/shared/components';
import { useEffect, useState } from 'react';

interface Props {
  id: string;
  name: string;
  imageUrl: string;
  categoryId: number;
  status: 'active' | 'archived';
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Props[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    }
    load();
  }, []);

  return (
    <div>
      <h1 className='text-xl font-bold mb-4'>Продукция</h1>
      <ProductTable products={products} />
    </div>
  );
}
