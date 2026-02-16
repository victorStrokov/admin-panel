/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

type ImageType = {
  id: number | string;
  url: string;
  sortOrder: number;
  isTemp?: boolean;
};

type Props = {
  product: {
    id: number;
    images: ImageType[];
  };
};

export function ProductImages({ product }: Props) {
  const [images, setImages] = React.useState<ImageType[]>(product.images);
  const [uploadingIds, setUploadingIds] = React.useState<string[]>([]);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

  // 1. MULTI UPLOAD + VALIDATION

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        alert('Можно загружать только изображения');
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Файл слишком большой (максимум 5 МБ)');
        continue;
      }

      const tempId = `temp-${Math.random()}`;
      const tempUrl = URL.createObjectURL(file);

      setImages((prev) => [
        ...prev,
        { id: tempId, url: tempUrl, sortOrder: prev.length, isTemp: true },
      ]);
      setUploadingIds((prev) => [...prev, tempId]);

      const form = new FormData();
      form.append('file', file);
      form.append('productId', String(product.id));

      try {
        const res = await fetch('/api/products/upload', {
          method: 'POST',
          body: form,
        });

        const data = await res.json();

        if (res.ok) {
          setImages((prev) =>
            prev.map((img) =>
              img.id === tempId
                ? {
                    id: data.image.id,
                    url: data.image.url,
                    sortOrder: img.sortOrder,
                  }
                : img,
            ),
          );
        } else {
          alert('Ошибка загрузки');
          setImages((prev) => prev.filter((img) => img.id !== tempId));
        }
      } catch {
        alert('Ошибка сети');
        setImages((prev) => prev.filter((img) => img.id !== tempId));
      } finally {
        setUploadingIds((prev) => prev.filter((id) => id !== tempId));
      }
    }
  }

  // 2. DELETE IMAGE

  async function deleteImage(imageId: number) {
    if (!confirm('Удалить изображение?')) return;

    try {
      const res = await fetch(`/api/products/${product.id}/images/${imageId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setImages((prev) => prev.filter((img) => img.id !== imageId));
      } else {
        alert('Ошибка удаления');
      }
    } catch {
      alert('Ошибка сети');
    }
  }

  // 3. SET MAIN IMAGE

  async function setMainImage(imageId: number) {
    const updated = [...images];
    const index = updated.findIndex((i) => i.id === imageId);
    if (index === -1) return;

    const [img] = updated.splice(index, 1);
    updated.unshift(img);

    setImages(updated);
    await saveSort(updated);
  }

  // 4. DRAG & DROP SORTING

  function handleDragStart(e: React.DragEvent, index: number) {
    e.dataTransfer.setData('index', String(index));
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    setDragOverIndex(index);
  }

  function handleDrop(e: React.DragEvent, index: number) {
    const from = Number(e.dataTransfer.getData('index'));
    const to = index;

    const updated = [...images];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);

    setDragOverIndex(null);
    setImages(updated);
    saveSort(updated);
  }

  async function saveSort(list: ImageType[]) {
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

  // RENDER

  return (
    <div className='space-y-4 border p-4 rounded'>
      <h2 className='text-xl font-semibold'>Изображения</h2>

      {/* Upload */}
      <div>
        <input
          type='file'
          accept='image/*'
          multiple
          onChange={handleUpload}
          className='hidden'
          id='upload-image'
        />
        <label htmlFor='upload-image'>
          <Button>Загрузить изображения</Button>
        </label>
      </div>

      {/* Images list */}
      <div className='grid grid-cols-4 gap-4'>
        {images.map((img, index) => {
          const isUploading = uploadingIds.includes(String(img.id));

          return (
            <div
              key={img.id}
              draggable={!isUploading}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              className={cn(
                'relative border rounded overflow-hidden transition',
                dragOverIndex === index && 'ring-2 ring-blue-500 opacity-80',
                isUploading && 'opacity-50',
              )}>
              <img
                src={img.url}
                alt=''
                className='w-full h-32 object-cover'
              />

              {/* Delete */}
              {!isUploading && (
                <button
                  onClick={() => deleteImage(Number(img.id))}
                  className='absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded'>
                  ×
                </button>
              )}

              {/* Set main */}
              {!isUploading && index !== 0 && (
                <button
                  onClick={() => setMainImage(Number(img.id))}
                  className='absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-1 rounded'>
                  Сделать главным
                </button>
              )}

              {index === 0 && (
                <div className='absolute bottom-1 left-1 bg-green-600 text-white text-xs px-2 py-1 rounded'>
                  Главное
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
