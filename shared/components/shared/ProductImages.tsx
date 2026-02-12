/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { Button } from '@/shared/components/ui/button';

type Props = {
  product: {
    id: number;
    images: { id: number; url: string; sortOrder: number }[];
  };
};

export function ProductImages({ product }: Props) {
  const [images, setImages] = React.useState(product.images);
  const [uploading, setUploading] = React.useState(false);

  // Загрузка изображения
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const form = new FormData();
    form.append('file', file);
    form.append('productId', String(product.id));

    const res = await fetch('/api/products/upload', {
      method: 'POST',
      body: form,
    });

    const data = await res.json();
    setUploading(false);

    if (res.ok) {
      setImages((prev) => [...prev, data.image]);
    } else {
      alert('Ошибка загрузки');
    }
  }

  // Удаление изображения
  async function deleteImage(imageId: number) {
    const res = await fetch(`/api/products/${product.id}/images/${imageId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } else {
      alert('Ошибка удаления');
    }
  }

  // Сортировка изображений (drag & drop)
  function handleDragStart(e: React.DragEvent, index: number) {
    e.dataTransfer.setData('index', String(index));
  }

  function handleDrop(e: React.DragEvent, index: number) {
    const from = Number(e.dataTransfer.getData('index'));
    const to = index;

    const updated = [...images];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);

    setImages(updated);
    saveSort(updated);
  }

  async function saveSort(list: typeof images) {
    await fetch(`/api/products/${product.id}/images/sort`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order: list.map((img, i) => ({
          id: img.id,
          sortOrder: i,
        })),
      }),
    });
  }

  return (
    <div className='space-y-4 border p-4 rounded'>
      <h2 className='text-xl font-semibold'>Изображения</h2>

      {/* Upload */}
      <div>
        <input
          type='file'
          accept='image/*'
          onChange={handleUpload}
          className='hidden'
          id='upload-image'
        />
        <label htmlFor='upload-image'>
          <Button disabled={uploading}>
            {uploading ? 'Загрузка...' : 'Загрузить изображение'}
          </Button>
        </label>
      </div>

      {/* Images list */}
      <div className='grid grid-cols-4 gap-4'>
        {images.map((img, index) => (
          <div
            key={img.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, index)}
            className='relative border rounded overflow-hidden'>
            <img
              src={img.url}
              alt=''
              className='w-full h-32 object-cover'
            />

            <button
              onClick={() => deleteImage(img.id)}
              className='absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded'>
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
