'use client';

import { useEffect, useState, useMemo } from 'react';
import type { Order } from '@prisma/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  OrderDetailsModal,
} from '@/shared/components';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/shared/components/ui/select';

import { Badge } from '@/shared/components/ui/badge';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
const SORT_BY = {
  DATE: 'date',
  AMOUNT: 'amount',
} as const;

type SortBy = (typeof SORT_BY)[keyof typeof SORT_BY];

const SORT_DIR = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

type SortDir = (typeof SORT_DIR)[keyof typeof SORT_DIR];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<number[]>([]);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // фильтры
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  // сортировка
  const [sortBy, setSortBy] = useState<SortBy>(SORT_BY.DATE);

  const [sortDir, setSortDir] = useState<SortDir>(SORT_DIR.DESC);
  //  фильтры по дате
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // локальная загрузка статуса
  const [statusLoading, setStatusLoading] = useState<Record<number, boolean>>(
    {},
  );

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/orders');
        if (!res.ok) throw new Error('Ошибка загрузки заказов');

        const data: Order[] = await res.json();
        setOrders(data);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError('Неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  function openModal(order: Order) {
    setSelectedOrder(order);
    setModalOpen(true);
  }

  // цветные бейджи статусов
  function renderStatusBadge(status: Order['status']) {
    const map = {
      PENDING: 'bg-yellow-500 text-black',
      SUCCEEDED: 'bg-green-600 text-white',
      CANCELLED: 'bg-red-600 text-white',
    } as const;

    return <Badge className={map[status]}>{status}</Badge>;
  }

  async function updateStatus(
    id: number,
    status: Order['status'],
    totalAmount: number,
  ) {
    const prevOrders = [...orders];

    // оптимистичное обновление
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));

    setStatusLoading((prev) => ({ ...prev, [id]: true }));

    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, totalAmount }),
      });

      if (!res.ok) throw new Error('Ошибка обновления статуса');

      const updated: Order = await res.json();

      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));

      toast.success(`Статус заказа #${id} обновлён`);
    } catch (err) {
      if (err instanceof Error) console.error(err.message);
      setOrders(prevOrders);
      toast.error('Не удалось обновить статус');
    } finally {
      setStatusLoading((prev) => ({ ...prev, [id]: false }));
    }
  }

  // ============================
  // ФИЛЬТРАЦИЯ + ПОИСК + СОРТИРОВКА
  // ============================

  const filteredAndSortedOrders = useMemo(() => {
    const searchLower = search.toLowerCase();

    let result = orders
      .filter((o) =>
        statusFilter === 'ALL' ? true : o.status === statusFilter,
      )
      .filter((o) =>
        [o.fullName, o.phone, o.email]
          .map((f) => f.toLowerCase())
          .some((field) => field.includes(searchLower)),
      );

    //  ФИЛЬТР ПО ДАТАМ

    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      result = result.filter((o) => new Date(o.createdAt).getTime() >= from);
    }

    if (dateTo) {
      const to = new Date(dateTo).getTime();
      result = result.filter((o) => new Date(o.createdAt).getTime() <= to);
    }

    //  СОРТИРОВКА
    result = result.sort((a, b) => {
      if (sortBy === SORT_BY.DATE) {
        const diff =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return sortDir === 'asc' ? diff : -diff;
      }

      if (sortBy === SORT_BY.AMOUNT) {
        const diff = a.totalAmount - b.totalAmount;
        return sortDir === 'asc' ? diff : -diff;
      }

      return 0;
    });

    return result;
  }, [orders, statusFilter, search, sortBy, sortDir, dateFrom, dateTo]);

  async function deleteOrder(id: number) {
    const prevOrders = [...orders];

    // оптимистичное удаление
    setOrders((prev) => prev.filter((o) => o.id !== id));

    try {
      const res = await fetch(`/api/orders?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Ошибка удаления заказа');

      toast.success(`Заказ #${id} удалён`);
    } catch (err) {
      if (err instanceof Error) console.error(err.message);
      // откат
      setOrders(prevOrders);
      toast.error('Не удалось удалить заказ');
    }
  }

  // открытия модалки подтверждения удаления
  function confirmDelete(id: number) {
    setDeleteId(id);
    setDeleteOpen(true);
  }

  async function bulkUpdateStatus(status: Order['status']) {
    const prev = [...orders];

    // оптимистично
    setOrders((prev) =>
      prev.map((o) => (selectedStatus.includes(o.id) ? { ...o, status } : o)),
    );

    try {
      const res = await fetch('/api/orders/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedStatus, status }),
      });

      if (!res.ok) throw new Error();

      toast.success('Статусы обновлены');
      setSelectedStatus([]);
    } catch {
      setOrders(prev);
      toast.error('Ошибка массового обновления');
    }
  }

  function exportCSV() {
    const rows = [
      ['ID', 'Статус', 'Сумма', 'Имя', 'Телефон', 'Email', 'Дата'],
      ...filteredAndSortedOrders.map((o) => [
        o.id,
        o.status,
        o.totalAmount,
        o.fullName,
        o.phone,
        o.email,
        new Date(o.createdAt).toLocaleString('ru-RU'),
      ]),
    ];

    const csv = rows.map((r) => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className='flex flex-col gap-6'>
      <h1 className='text-3xl font-bold'>Заказы</h1>

      {/* Панель фильтров */}
      <div className='flex items-center gap-4'>
        {/* Фильтр по статусу */}
        <Select
          defaultValue='ALL'
          onValueChange={(value) => setStatusFilter(value)}>
          <SelectTrigger className='w-36'>
            <SelectValue placeholder='Фильтр' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='ALL'>Все</SelectItem>
            <SelectItem value='PENDING'>Ожидает</SelectItem>
            <SelectItem value='SUCCEEDED'>Успешно</SelectItem>
            <SelectItem value='CANCELLED'>Отменён</SelectItem>
          </SelectContent>
        </Select>

        {/* Поиск */}
        <input
          type='text'
          placeholder='Поиск: имя, телефон, email'
          className='border rounded px-3 py-2 w-80'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Сортировка по полю */}
        <Select
          defaultValue={SORT_BY.DATE}
          onValueChange={(value: SortBy) => setSortBy(value)}>
          <SelectTrigger className='w-36'>
            <SelectValue placeholder='Сортировка' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='date'>Дата</SelectItem>
            <SelectItem value='amount'>Сумма</SelectItem>
          </SelectContent>
        </Select>

        {/* Направление сортировки */}
        <Select
          defaultValue={SORT_DIR.DESC}
          onValueChange={(value: SortDir) => setSortDir(value)}>
          <SelectTrigger className='w-20'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='asc'>↑</SelectItem>
            <SelectItem value='desc'>↓</SelectItem>
          </SelectContent>
        </Select>

        {selectedStatus.length > 0 && (
          <div className='flex items-center gap-4 p-3 bg-muted rounded'>
            <span>Выбрано: {selectedStatus.length}</span>

            <Select
              onValueChange={(value) =>
                bulkUpdateStatus(value as Order['status'])
              }>
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Изменить статус' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='PENDING'>Ожидает</SelectItem>
                <SelectItem value='SUCCEEDED'>Успешно</SelectItem>
                <SelectItem value='CANCELLED'>Отменён</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <input
          type='date'
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className='border rounded px-3 py-2'
        />

        <input
          type='date'
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className='border rounded px-3 py-2'
        />
        <button
          onClick={exportCSV}
          className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>
          Экспорт CSV
        </button>
      </div>

      {loading && <p>Загрузка...</p>}
      {error && <p className='text-red-500'>{error}</p>}

      {!loading && !error && (
        <div className='border rounded-lg overflow-hidden'>
          <table className='w-full text-sm'>
            <thead className='bg-muted'>
              <tr>
                {/* Чекбокс для выделения всех */}
                <th className='p-3'>
                  <input
                    type='checkbox'
                    checked={
                      selectedStatus.length > 0 &&
                      selectedStatus.length === filteredAndSortedOrders.length
                    }
                    onChange={(e) =>
                      setSelectedStatus(
                        e.target.checked
                          ? filteredAndSortedOrders.map((o) => o.id)
                          : [],
                      )
                    }
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
              {filteredAndSortedOrders.map((order) => (
                <tr
                  key={order.id}
                  className='border-t hover:bg-muted/50'>
                  {/* ЧЕКБОКС — ВСТАВЛЯЕМ СЮДА */}
                  <td className='p-3'>
                    <input
                      type='checkbox'
                      checked={selectedStatus.includes(order.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStatus((prev) => [...prev, order.id]);
                        } else {
                          setSelectedStatus((prev) =>
                            prev.filter((id) => id !== order.id),
                          );
                        }
                      }}
                    />
                  </td>

                  {/* ID */}
                  <td
                    className='p-3 cursor-pointer'
                    onClick={() => openModal(order)}>
                    {order.id}
                  </td>

                  {/* СТАТУС */}
                  <td className='p-3'>
                    <div className='flex items-center gap-2'>
                      {renderStatusBadge(order.status)}

                      <Select
                        defaultValue={order.status}
                        onValueChange={(value) =>
                          updateStatus(
                            order.id,
                            value as Order['status'],
                            order.totalAmount,
                          )
                        }>
                        <SelectTrigger className='w-36'>
                          {statusLoading[order.id] ? (
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

                  {/* Кнопка удаления */}
                  <td className='p-3'>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDelete(order.id);
                      }}
                      className='text-red-600 hover:text-red-800'>
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <OrderDetailsModal
        order={selectedOrder}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      <AlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить заказ?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Заказ будет удалён навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteOrder(deleteId!)}
              className='bg-red-600 hover:bg-red-700'>
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
