'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import {
  ProductImages,
  ProductInventory,
  ProductMainInfo,
  ProductVariants,
} from '@/shared/components';

type Product = {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string | null;
  status: 'ACTIVE' | 'ARCHIVED' | 'DRAFT';
  categoryId: number;
  shortDesc?: string | null;
  fullDesc?: string | null;
  category: { id: number; name: string } | null;
  images: { id: number; url: string; sortOrder: number }[];
  items: {
    id: number;
    sku: string;
    price: number;
    inventory: { id: number; quantity: number };
  }[];
};

export default function ProductEditPage() {
  const params = useParams();
  const productId = Number(params.id);

  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      const res = await fetch(`/api/products/${productId}`);
      const data = await res.json();
      setProduct(data.product);
      setLoading(false);
    }
    load();
  }, [productId]);

  if (loading) {
    return <div className='p-6'>Загрузка...</div>;
  }

  if (!product) {
    return <div className='p-6'>Товар не найден</div>;
  }

  return (
    <div className='p-6 space-y-10'>
      <h1 className='text-2xl font-bold'>Редактирование: {product.name}</h1>

      {/* 1. Основная информация */}
      <ProductMainInfo product={product} />

      {/* 2. Изображения */}
      <ProductImages product={product} />

      {/* 3. Варианты товара */}
      <ProductVariants product={product} />

      {/* 4. Inventory */}
      <ProductInventory product={product} />
    </div>
  );
}
