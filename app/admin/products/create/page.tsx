'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import slugify from 'slugify';
import { getCsrfToken } from '@/shared/lib/get-csrf-token';

import {
  Button,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Textarea,
} from '@/shared/components/ui';
import { Input } from '@/shared/components/ui/input';

type Category = {
  id: number;
  name: string;
};

export default function CreateProductPage() {
  const router = useRouter();

  const [name, setName] = React.useState('');
  const slug = slugify(name, { lower: true });

  const [categoryId, setCategoryId] = React.useState<number | null>(null);
  const [status, setStatus] = React.useState<'ACTIVE' | 'ARCHIVED' | 'DRAFT'>(
    'ACTIVE',
  );
  const [shortDesc, setShortDesc] = React.useState('');
  const [fullDesc, setFullDesc] = React.useState('');
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data.categories || []);
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryId) return;

    setLoading(true);

    let imageUrl: string | null = null;

    // 1. Загружаем изображение
    if (imageFile) {
      setUploading(true);

      const form = new FormData();
      form.append('file', imageFile);

      const uploadRes = await fetch('/api/products/upload-temp', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': getCsrfToken(),
        },
        body: form,
      });

      setUploading(false);

      if (!uploadRes.ok) {
        alert('Ошибка загрузки изображения');
        setLoading(false);
        return;
      }

      const uploadData = await uploadRes.json();
      imageUrl = uploadData.url;
    }


    // 2. Создаём продукт
   const res = await fetch('/api/products', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'X-CSRF-Token': getCsrfToken(),
     },
     body: JSON.stringify({
       name,
       slug,
       categoryId,
       status,
       shortDesc,
       fullDesc,
       imageUrl,
     }),
   });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      router.push(`/admin/products/${data.product.id}`);
    } else {
      alert('Ошибка: ' + JSON.stringify(data.error));
    }
  }

  return (
    <div className='p-6 max-w-3xl space-y-6'>
      <h1 className='text-2xl font-bold'>Создать продукт</h1>

      <form
        onSubmit={handleSubmit}
        className='space-y-6'>
        <div className='space-y-2'>
          <Label>Название</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='Например: ПВХ профиль REACHMONT'
            required
          />
        </div>

        <div className='space-y-2'>
          <Label>Slug</Label>
          <Input
            value={slug}
            readOnly
            className='bg-gray-100'
          />
        </div>

        <div className='space-y-2'>
          <Label>Категория</Label>
          <Select onValueChange={(v) => setCategoryId(Number(v))}>
            <SelectTrigger>
              <SelectValue placeholder='Выберите категорию' />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem
                  key={c.id}
                  value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label>Статус</Label>
          <Select
            onValueChange={(v: 'ACTIVE' | 'DRAFT' | 'ARCHIVED') => setStatus(v)}
            defaultValue='ACTIVE'>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='ACTIVE'>ACTIVE</SelectItem>
              <SelectItem value='DRAFT'>DRAFT</SelectItem>
              <SelectItem value='ARCHIVED'>ARCHIVED</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label>Краткое описание</Label>
          <Textarea
            value={shortDesc}
            onChange={(e) => setShortDesc(e.target.value)}
            placeholder='Краткое описание товара'
          />
        </div>

        <div className='space-y-2'>
          <Label>Полное описание</Label>
          <Textarea
            value={fullDesc}
            onChange={(e) => setFullDesc(e.target.value)}
            placeholder='Полное описание товара'
          />
        </div>

        <div className='space-y-2'>
          <Label>Изображение</Label>
          <Input
            type='file'
            accept='image/*'
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
          {uploading && <p className='text-sm text-gray-500'>Загрузка...</p>}
        </div>

        <Button
          type='submit'
          disabled={loading || uploading}>
          {loading ? 'Создание...' : 'Создать продукт'}
        </Button>
      </form>
    </div>
  );
}
