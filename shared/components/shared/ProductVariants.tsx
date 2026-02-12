'use client';

import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Dialog, DialogContent } from '@/shared/components/ui/dialog';
import { getCsrfToken } from '@/shared/lib/get-csrf-token';

type Variant = {
  id: number;
  sku: string;
  price: number;
  inventory: { id: number; quantity: number };
};

type Props = {
  product: {
    id: number;
    items: Variant[];
  };
};

export function ProductVariants({ product }: Props) {
  const [variants, setVariants] = React.useState(product.items);

  const [openCreate, setOpenCreate] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState<Variant | null>(null);

  const [price, setPrice] = React.useState('');
  const [editPrice, setEditPrice] = React.useState('');

  // Создание варианта
  async function createVariant() {
    const res = await fetch('/api/product-item', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCsrfToken(),
      },
      body: JSON.stringify({
        productId: product.id,
        price: Number(price),
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setVariants((prev) => [...prev, data.item]);
      setOpenCreate(false);
      setPrice('');
    } else {
      alert('Ошибка создания варианта');
    }
  }

  // Обновление варианта
  async function updateVariant() {
    if (!openEdit) return;

    const res = await fetch(`/api/product-item/${openEdit.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCsrfToken(),
      },
      body: JSON.stringify({
        productId: product.id,
        price: Number(editPrice),
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setVariants((prev) =>
        prev.map((v) => (v.id === openEdit.id ? data.item : v)),
      );
      setOpenEdit(null);
    } else {
      alert('Ошибка обновления варианта');
    }
  }

  // Удаление варианта
  async function deleteVariant(id: number) {
    const res = await fetch(`/api/product-item/${id}`, {
      method: 'DELETE',
      headers: {
        'X-CSRF-Token': getCsrfToken(),
      },
    });

    if (res.ok) {
      setVariants((prev) => prev.filter((v) => v.id !== id));
    } else {
      alert('Ошибка удаления варианта');
    }
  }

  return (
    <div className='space-y-4 border p-4 rounded'>
      <h2 className='text-xl font-semibold'>Варианты товара</h2>

      <Button onClick={() => setOpenCreate(true)}>Добавить вариант</Button>

      <table className='w-full text-sm mt-4 border'>
        <thead>
          <tr className='border-b'>
            <th className='text-left p-2'>SKU</th>
            <th className='text-left p-2'>Цена</th>
            <th className='text-left p-2'>Остаток</th>
            <th className='text-right p-2'>Действия</th>
          </tr>
        </thead>
        <tbody>
          {variants.map((v) => (
            <tr
              key={v.id}
              className='border-b'>
              <td className='p-2'>{v.sku}</td>
              <td className='p-2'>{v.price} ₽</td>
              <td className='p-2'>{v.inventory.quantity}</td>
              <td className='p-2 text-right space-x-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setOpenEdit(v);
                    setEditPrice(String(v.price));
                  }}>
                  Редактировать
                </Button>

                <Button
                  variant='destructive'
                  size='sm'
                  onClick={() => deleteVariant(v.id)}>
                  Удалить
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Модалка создания */}
      <Dialog
        open={openCreate}
        onOpenChange={setOpenCreate}>
        <DialogContent>
          <h3 className='text-lg font-semibold mb-4'>Создать вариант</h3>

          <div className='space-y-2'>
            <Label>Цена</Label>
            <Input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder='Введите цену'
            />
          </div>

          <div className='flex justify-end gap-2 mt-4'>
            <Button
              variant='outline'
              onClick={() => setOpenCreate(false)}>
              Отмена
            </Button>
            <Button onClick={createVariant}>Создать</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Модалка редактирования */}
      <Dialog
        open={!!openEdit}
        onOpenChange={() => setOpenEdit(null)}>
        <DialogContent>
          <h3 className='text-lg font-semibold mb-4'>Редактировать вариант</h3>

          <div className='space-y-2'>
            <Label>Цена</Label>
            <Input
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
            />
          </div>

          <div className='flex justify-end gap-2 mt-4'>
            <Button
              variant='outline'
              onClick={() => setOpenEdit(null)}>
              Отмена
            </Button>
            <Button onClick={updateVariant}>Сохранить</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
