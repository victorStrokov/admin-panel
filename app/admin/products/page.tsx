'use client';

import { ProductTable } from '@/shared/components';
import { useEffect, useState } from 'react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);

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
      <h1 className='text-xl font-bold mb-4'>Products</h1>
      <ProductTable products={products} />
    </div>
  );
}
