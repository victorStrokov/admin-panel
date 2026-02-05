import { useEffect, useState } from 'react';
import type { Order } from '@prisma/client';
import toast from 'react-hot-toast';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // локальная загрузка статуса
  const [statusLoading, setStatusLoading] = useState<Record<number, boolean>>(
    {},
  );
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // загрузка заказов
  async function loadOrders() {
    try {
      setLoading(true);
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Ошибка загрузки заказов');

      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  // обновление статуса заказа
  async function updateStatus(
    id: number,
    status: Order['status'],
    totalAmount: number,
  ) {
    const prev = [...orders];

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
    } catch {
      setOrders(prev);
      toast.error('Не удалось обновить статус');
    } finally {
      setStatusLoading((prev) => ({ ...prev, [id]: false }));
    }
  }

  // УДАЛЕНИЕ

  async function deleteOrder(id: number) {
    const prev = [...orders];

    setOrders((prev) => prev.filter((o) => o.id !== id));

    try {
      const res = await fetch(`/api/orders?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Ошибка удаления');

      toast.success(`Заказ #${id} удалён`);
    } catch {
      setOrders(prev);
      toast.error('Не удалось удалить заказ');
    }
  }

  // МАССОВОЕ ОБНОВЛЕНИЕ СТАТУСОВ

  async function bulkUpdateStatus(status: Order['status']) {
    const prev = [...orders];

    setOrders((prev) =>
      prev.map((o) => (selectedIds.includes(o.id) ? { ...o, status } : o)),
    );

    try {
      const res = await fetch('/api/orders/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, status }),
      });

      if (!res.ok) throw new Error();

      toast.success('Статусы обновлены');
      setSelectedIds([]);
    } catch {
      setOrders(prev);
      toast.error('Ошибка массового обновления');
    }
  }

  return {
    orders,
    loading,
    error,
    statusLoading,
    selectedIds,
    setSelectedIds,
    updateStatus,
    deleteOrder,
    bulkUpdateStatus,
    loadOrders,
  };
}
