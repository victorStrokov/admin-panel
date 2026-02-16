'use client';

import { useState } from 'react';
import { Button, Label } from '../ui';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { cn } from '@/shared/lib/utils';

interface ProductFormData {
  name: string;
  categoryId: number;
  shortDesc?: string;
  fullDesc?: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'DRAFT';
}

interface Props {
  onSubmit: (data: ProductFormData) => void;
  initialData?: Partial<ProductFormData>;
  categories: { id: number; name: string }[];
}

export const ProductForm: React.FC<Props> = ({
  onSubmit,
  initialData,
  categories,
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [categoryId, setCategoryId] = useState(
    initialData?.categoryId?.toString() || '',
  );
  const [shortDesc, setShortDesc] = useState(initialData?.shortDesc || '');
  const [fullDesc, setFullDesc] = useState(initialData?.fullDesc || '');
  const [status, setStatus] = useState(initialData?.status || 'ACTIVE');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          name,
          categoryId: Number(categoryId),
          shortDesc,
          fullDesc,
          status,
        });
      }}
      className={cn('space-y-4', 'p-4', 'border', 'rounded')}>
      <div>
        <Label>Название</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <Label>Категория</Label>
        <select
          className='border p-2 rounded w-full'
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}>
          <option value=''>Выберите категорию</option>
          {categories.map((c) => (
            <option
              key={c.id}
              value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label>Краткое описание</Label>
        <Textarea
          value={shortDesc}
          onChange={(e) => setShortDesc(e.target.value)}
        />
      </div>

      <div>
        <Label>Полное описание</Label>
        <Textarea
          value={fullDesc}
          onChange={(e) => setFullDesc(e.target.value)}
        />
      </div>

      <div>
        <Label>Статус</Label>
        <select
          className='border p-2 rounded w-full'
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as 'ACTIVE' | 'ARCHIVED' | 'DRAFT')
          }>
          <option value='ACTIVE'>Активен</option>
          <option value='DRAFT'>Черновик</option>
          <option value='ARCHIVED'>Архив</option>
        </select>
      </div>

      <Button type='submit'>Сохранить</Button>
    </form>
  );
};
