'use client';

import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

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

export function ProductInventory({ product }: Props) {
  const [variants, setVariants] = React.useState(product.items);
  const [editing, setEditing] = React.useState<number | null>(null);
  const [manualQty, setManualQty] = React.useState('');

  async function updateQuantity(inventoryId: number, newQty: number) {
    const res = await fetch(`/api/inventory/${inventoryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: newQty }),
    });

    if (!res.ok) {
      alert('Ошибка обновления количества');
      return;
    }

    setVariants((prev) =>
      prev.map((v) =>
        v.inventory.id === inventoryId
          ? { ...v, inventory: { ...v.inventory, quantity: newQty } }
          : v,
      ),
    );
  }

  function increment(v: Variant) {
    updateQuantity(v.inventory.id, v.inventory.quantity + 1);
  }

  function decrement(v: Variant) {
    updateQuantity(v.inventory.id, Math.max(0, v.inventory.quantity - 1));
  }

  async function saveManual(v: Variant) {
    const qty = Number(manualQty);
    if (isNaN(qty)) return;

    await updateQuantity(v.inventory.id, qty);
    setEditing(null);
    setManualQty('');
  }

  return (
    <div className='space-y-4 border p-4 rounded'>
      <h2 className='text-xl font-semibold'>Остатки</h2>

      <table className='w-full text-sm border'>
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

              {/* Количество */}
              <td className='p-2'>
                {editing === v.inventory.id ? (
                  <Input
                    value={manualQty}
                    onChange={(e) => setManualQty(e.target.value)}
                    className='w-20'
                  />
                ) : (
                  v.inventory.quantity
                )}
              </td>

              {/* Действия */}
              <td className='p-2 text-right space-x-2'>
                {editing === v.inventory.id ? (
                  <>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => {
                        setEditing(null);
                        setManualQty('');
                      }}>
                      Отмена
                    </Button>
                    <Button
                      size='sm'
                      onClick={() => saveManual(v)}>
                      Сохранить
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => decrement(v)}>
                      -1
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => increment(v)}>
                      +1
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => {
                        setEditing(v.inventory.id);
                        setManualQty(String(v.inventory.quantity));
                      }}>
                      Изменить
                    </Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
