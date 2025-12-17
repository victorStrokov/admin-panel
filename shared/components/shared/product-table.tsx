'use client';

import { useState } from 'react';

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
import { cn } from '@/lib/utils';

export type Product = {
  id: string;
  name: string;
  price?: number;
  status: 'active' | 'archived';
};

export function ProductTable({ products }: { products: Product[] }) {
  const [selected, setSelected] = useState<Product | null>(null);

  return (
    <Table className={cn('w-full', 'border', 'rounded')}>
      <TableHeader>
        <TableRow>
          <TableHead>Название</TableHead>
          <TableHead>Цена</TableHead>
          <TableHead>Статус</TableHead>
          <TableHead className='text-right'>Действия</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((p) => (
          <TableRow key={p.id}>
            <TableCell>{p.name}</TableCell>
            <TableCell>{p.price} ₽</TableCell>
            <TableCell>
              <Badge variant={p.status === 'active' ? 'default' : 'secondary'}>
                {p.status}
              </Badge>
            </TableCell>
            <TableCell className='text-right space-x-2'>
              <Button
                variant='outline'
                size='sm'>
                Редактировать
              </Button>
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
                    <Button variant='destructive'>Удалить</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
