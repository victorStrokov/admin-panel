'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '../ui';

export type InventoryColumn = {
  id: string;
  productItemId: string;
  quantity: number;
  onEdit: (data: InventoryColumn) => void;
  onDelete: (data: InventoryColumn) => void;
  onLog: (data: InventoryColumn) => void;
};

export const inventoryColumns: ColumnDef<InventoryColumn>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'productItemId',
    header: 'Product Item',
  },
  {
    accessorKey: 'quantity',
    header: 'Quantity',
    cell: ({ row }) => {
      const q = row.original.quantity;
      return (
        <span
          className={q === 0 ? 'text-red-600' : q < 5 ? 'text-yellow-600' : ''}>
          {q}
        </span>
      );
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className='flex justify-end gap-2'>
          <Button
            size='sm'
            onClick={() => item.onEdit(item)}>
            Edit
          </Button>
          <Button
            size='sm'
            variant='destructive'
            onClick={() => item.onDelete(item)}>
            Delete
          </Button>
          <Button
            size='sm'
            variant='secondary'
            onClick={() => item.onLog(item)}>
            Log
          </Button>
        </div>
      );
    },
  },
];
