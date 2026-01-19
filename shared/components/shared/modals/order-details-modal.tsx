'use client';

import type { Order } from '@prisma/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui';

interface Props {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}

export function OrderDetailsModal({ order, open, onClose }: Props) {
  if (!order) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={onClose}>
      <DialogContent className='max-w-xl'>
        <DialogHeader>
          <DialogTitle>Заказ #{order.id}</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <div>
            <p>
              <strong>Статус:</strong> {order.status}
            </p>
            <p>
              <strong>Сумма:</strong> {order.totalAmount} ₽
            </p>
            <p>
              <strong>Имя:</strong> {order.fullName}
            </p>
            <p>
              <strong>Телефон:</strong> {order.phone}
            </p>
            <p>
              <strong>Email:</strong> {order.email}
            </p>
            <p>
              <strong>Адрес:</strong> {order.address}
            </p>
            {order.comment && (
              <p>
                <strong>Комментарий:</strong> {order.comment}
              </p>
            )}
            <p>
              <strong>Дата:</strong>{' '}
              {new Date(order.createdAt).toLocaleString('ru-RU')}
            </p>
          </div>

          <div>
            <h3 className='font-semibold mb-2'>Товары</h3>
            <div className='space-y-2'>
              {Array.isArray(order.items) &&
                order.items.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className='border p-2 rounded'>
                    <p>
                      <strong>{item.name}</strong>
                    </p>
                    <p>Цена: {item.price} ₽</p>
                    <p>Количество: {item.quantity}</p>

                    {item.ingredients?.length > 0 && (
                      <div className='mt-1'>
                        <p className='font-medium'>Ингредиенты:</p>
                        <ul className='list-disc ml-5'>
                          {item.ingredients.map((ing: any) => (
                            <li key={ing.id}>
                              {ing.name} — {ing.price} ₽
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
