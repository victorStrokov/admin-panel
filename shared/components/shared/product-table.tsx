/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';

import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui';

import { cn } from '@/shared/lib/utils';

export type Product = {
  id: number;
  name: string;
  slug: string;
  images: { id: number; url: string }[];
  status: 'ACTIVE' | 'ARCHIVED' | 'DRAFT';
  category: { id: number; name: string } | null;
  items: { id: number; price: number | null }[];
};

export function ProductTable({ products }: { products: Product[] }) {
  return (
    <Table className={cn('w-full', 'border', 'rounded')}>
      <TableHeader>
        <TableRow>
          <TableHead>Товар</TableHead>
          <TableHead>Категория</TableHead>
          <TableHead>Статус</TableHead>
          <TableHead>Варианты</TableHead>
          <TableHead className='text-right'>Действия</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {products.map((p) => {
          const minPrice =
            p.items.length > 0
              ? Math.min(...p.items.map((i) => i.price ?? 0))
              : null;

          return (
            <TableRow key={p.id}>
              {/* Название + картинка + slug */}
              <TableCell>
                <div className='flex items-center gap-3'>
                  <img
                    src={p.images?.[0]?.url || '/placeholder.png'}
                    alt={p.name}
                    className='w-12 h-12 rounded object-cover border'
                  />

                  <div>
                    <div className='font-medium'>{p.name}</div>
                    <div className='text-xs text-gray-500'>{p.slug}</div>

                    {minPrice !== null && (
                      <div className='text-sm text-gray-700'>
                        от {minPrice} ₽
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>

              {/* Категория */}
              <TableCell>
                {p.category ? (
                  <span>{p.category.name}</span>
                ) : (
                  <span className='text-gray-400'>—</span>
                )}
              </TableCell>

              {/* Статус */}
              <TableCell>
                <Badge
                  variant={
                    p.status === 'ACTIVE'
                      ? 'default'
                      : p.status === 'DRAFT'
                        ? 'secondary'
                        : 'outline'
                  }>
                  {p.status}
                </Badge>
              </TableCell>

              {/* Количество вариантов */}
              <TableCell>{p.items.length}</TableCell>

              {/* Действия */}
              <TableCell className='text-right space-x-2'>
                <Link href={`/admin/products/${p.id}`}>
                  <Button
                    variant='outline'
                    size='sm'>
                    Редактировать
                  </Button>
                </Link>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant='destructive'
                      size='sm'>
                      Удалить
                    </Button>
                  </DialogTrigger>

                  <DialogContent>
                    <p>
                      Удалить товар <b>{p.name}</b>?
                    </p>

                    <div className='flex justify-end gap-2 mt-4'>
                      <Button variant='outline'>Отмена</Button>

                      <Button
                        variant='destructive'
                        onClick={async () => {
                          await fetch(`/api/products?id=${p.id}`, {
                            method: 'DELETE',
                          });
                          window.location.reload();
                        }}>
                        Удалить
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
