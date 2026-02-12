'use client';

import React from 'react';
import slugify from 'slugify';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/shared/components/ui/select';
import { Product } from '@/@types/product';
import { Category } from '@/@types/category';

type Props = {
  product: Product;
};

export function ProductMainInfo({ product }: Props) {
  const [name, setName] = React.useState(product.name);
  const slug = slugify(name, { lower: true });
  const [status, setStatus] = React.useState(product.status);
  const [shortDesc, setShortDesc] = React.useState(product.shortDesc || '');
  const [fullDesc, setFullDesc] = React.useState(product.fullDesc || '');
  const [categoryId, setCategoryId] = React.useState(product.categoryId);
  const [categories, setCategories] = React.useState([]);

  React.useEffect(() => {
    async function load() {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data.categories || []);
    }
    load();
  }, []);

  async function save() {
    const res = await fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        slug,
        status,
        shortDesc,
        fullDesc,
        categoryId,
      }),
    });

    if (!res.ok) {
      alert('Ошибка сохранения');
    }
  }

  return (
    <div className='space-y-4 border p-4 rounded'>
      <h2 className='text-xl font-semibold'>Основная информация</h2>

      <div className='space-y-2'>
        <Label>Название</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
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
        <Select
          onValueChange={(v) => setCategoryId(Number(v))}
          defaultValue={String(categoryId)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c: Category) => (
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
          defaultValue={status}>
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
        />
      </div>

      <div className='space-y-2'>
        <Label>Полное описание</Label>
        <Textarea
          value={fullDesc}
          onChange={(e) => setFullDesc(e.target.value)}
        />
      </div>

      <Button onClick={save}>Сохранить</Button>
    </div>
  );
}
