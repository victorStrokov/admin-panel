'use client';

import { useState } from 'react';
import { Button, Label } from '../ui';
import { Input } from '../ui/input';
import { cn } from '@/shared/lib/utils';

interface ProductFormData {
  name: string;
  imageUrl: string;
  categoryId: number;
}

interface Props {
  onSubmit: (data: ProductFormData) => void;
  initialData?: ProductFormData;
}

export const ProductForm: React.FC<Props> = ({ onSubmit, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [categoryId, setCategoryId] = useState(
    initialData?.categoryId?.toString() || ''
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          name,
          imageUrl,
          categoryId: Number(categoryId),
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
        <Label>Изображение</Label>
        <Input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </div>
      <div>
        <Label>Категория</Label>
        <Input
          type='number'
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        />
      </div>
      <Button type='submit'>Сохранить</Button>
    </form>
  );
};
