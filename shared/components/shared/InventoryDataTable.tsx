'use client';

import type { InventoryItem } from '@/@types/inventory';

interface InventoryDataTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onViewLog: (item: InventoryItem) => void;
}

export function InventoryDataTable({
  items,
  onEdit,
  onDelete,
  onViewLog,
}: InventoryDataTableProps) {
  return (
    <div className='rounded-lg border bg-white shadow-sm'>
      <table className='w-full text-sm'>
        <thead className='bg-gray-50 border-b'>
          <tr>
            <th className='px-4 py-2 text-left'>ID</th>
            <th className='px-4 py-2 text-left'>Product Item</th>
            <th className='px-4 py-2 text-left'>Quantity</th>
            <th className='px-4 py-2 text-right'>Actions</th>
          </tr>
        </thead>

        <tbody>
          {items.map((inv) => (
            <tr
              key={inv.id}
              className='border-b hover:bg-gray-50'>
              <td className='px-4 py-2'>{inv.id}</td>
              <td className='px-4 py-2'>{inv.productItemId}</td>
              <td className='px-4 py-2'>{inv.quantity}</td>

              <td className='px-4 py-2 text-right space-x-2'>
                <button
                  onClick={() => onEdit(inv)}
                  className='px-3 py-1 rounded bg-blue-600 text-white'>
                  Edit
                </button>

                <button
                  onClick={() => onDelete(inv)}
                  className='px-3 py-1 rounded bg-red-600 text-white'>
                  Delete
                </button>

                <button
                  onClick={() => onViewLog(inv)}
                  className='px-3 py-1 rounded bg-gray-700 text-white'>
                  Log
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
