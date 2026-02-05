import type { Order } from '@prisma/client';
import { OrderRow } from './OrderRow';

type OrdersTableProps = {
  orders: Order[];
  selectedIds: number[];
  setSelectedIds: (ids: number[]) => void;
  onOpenDetails: (order: Order) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: Order['status'], amount: number) => void;
  statusLoading: Record<number, boolean>;
};

export function OrdersTable({
  orders,
  selectedIds,
  setSelectedIds,
  onOpenDetails,
  onDelete,
  onStatusChange,
  statusLoading,
}: OrdersTableProps) {
  const toggleSelect = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    }
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? orders.map((o) => o.id) : []);
  };

  return (
    <div className='border rounded-lg overflow-hidden'>
      <table className='w-full text-sm'>
        <thead className='bg-muted'>
          <tr>
            <th className='p-3'>
              <input
                type='checkbox'
                checked={
                  selectedIds.length > 0 && selectedIds.length === orders.length
                }
                onChange={(e) => toggleSelectAll(e.target.checked)}
              />
            </th>

            <th className='p-3 text-left'>ID</th>
            <th className='p-3 text-left'>Статус</th>
            <th className='p-3 text-left'>Сумма</th>
            <th className='p-3 text-left'>Имя</th>
            <th className='p-3 text-left'>Телефон</th>
            <th className='p-3 text-left'>Дата</th>
            <th className='p-3 text-left'>Действия</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              selected={selectedIds.includes(order.id)}
              toggleSelect={toggleSelect}
              onOpenDetails={onOpenDetails}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
              statusLoading={statusLoading[order.id]}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
