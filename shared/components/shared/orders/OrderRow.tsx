import type { Order } from '@prisma/client';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { Loader2 } from 'lucide-react';

type OrderRowProps = {
  order: Order;
  selected: boolean;
  toggleSelect: (id: number, checked: boolean) => void;
  onOpenDetails: (order: Order) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: Order['status'], amount: number) => void;
  statusLoading: boolean;
};

export function OrderRow({
  order,
  selected,
  toggleSelect,
  onOpenDetails,
  onDelete,
  onStatusChange,
  statusLoading,
}: OrderRowProps) {
  const renderStatusBadge = (status: Order['status']) => {
    const map = {
      PENDING: 'bg-yellow-500 text-black',
      SUCCEEDED: 'bg-green-600 text-white',
      CANCELLED: 'bg-red-600 text-white',
    } as const;

    return <Badge className={map[status]}>{status}</Badge>;
  };

  return (
    <tr className='border-t hover:bg-muted/50'>
      <td className='p-3'>
        <input
          type='checkbox'
          checked={selected}
          onChange={(e) => toggleSelect(order.id, e.target.checked)}
        />
      </td>

      <td
        className='p-3 cursor-pointer'
        onClick={() => onOpenDetails(order)}>
        {order.id}
      </td>

      <td className='p-3'>
        <div className='flex items-center gap-2'>
          {renderStatusBadge(order.status)}

          <Select
            defaultValue={order.status}
            onValueChange={(value) =>
              onStatusChange(
                order.id,
                value as Order['status'],
                order.totalAmount,
              )
            }>
            <SelectTrigger className='w-36'>
              {statusLoading ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <SelectValue />
              )}
            </SelectTrigger>

            <SelectContent>
              <SelectItem value='PENDING'>Ожидает</SelectItem>
              <SelectItem value='SUCCEEDED'>Успешно</SelectItem>
              <SelectItem value='CANCELLED'>Отменён</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </td>

      <td className='p-3'>{order.totalAmount} ₽</td>
      <td className='p-3'>{order.fullName}</td>
      <td className='p-3'>{order.phone}</td>
      <td className='p-3'>
        {new Date(order.createdAt).toLocaleString('ru-RU')}
      </td>

      <td className='p-3'>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(order.id);
          }}
          className='text-red-600 hover:text-red-800'>
          Удалить
        </button>
      </td>
    </tr>
  );
}
