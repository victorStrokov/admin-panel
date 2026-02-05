'use client';

import { useState } from 'react';
import type { Order } from '@prisma/client';
import { useOrderFilters, useOrders } from '@/shared/hooks';
import { OrdersFilters } from '@/shared/components/shared/orders/OrdersFilters';
import { OrdersTable } from '@/shared/components/shared/orders/OrdersTable';
import { DeleteOrderDialog } from '@/shared/components/shared/orders/DeleteOrderDialog';
import { OrderDetailsDialog } from '@/shared/components/shared/orders/OrderDetailsDialog';

export default function AdminOrdersPage() {
  const {
    orders,
    loading,
    error,
    statusLoading,
    selectedIds,
    setSelectedIds,
    updateStatus,
    deleteOrder,
    bulkUpdateStatus,
  } = useOrders();
  const {
    filteredAndSortedOrders,
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
  } = useOrderFilters(orders);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  function openModal(order: Order) {
    setSelectedOrder(order);
    setModalOpen(true);
  }
  // открытия модалки подтверждения удаления
  function confirmDelete(id: number) {
    setDeleteId(id);
    setDeleteOpen(true);
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
        <OrdersFilters
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          search={search}
          setSearch={setSearch}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortDir={sortDir}
          setSortDir={setSortDir}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          selectedIds={selectedIds}
          bulkUpdateStatus={bulkUpdateStatus}
          exportCSV={exportCSV}
        />
      </div>
      {loading && <p>Загрузка...</p>}
      {error && <p className='text-red-500'>{error}</p>}
      {!loading && !error && (
        <div className='border rounded-lg overflow-hidden'>
          <OrdersTable
            orders={filteredAndSortedOrders}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            onOpenDetails={openModal}
            onDelete={confirmDelete}
            onStatusChange={updateStatus}
            statusLoading={statusLoading}
          />
        </div>
      )}
      <OrderDetailsDialog
        order={selectedOrder}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
      <DeleteOrderDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        orderId={deleteId}
        onConfirm={deleteOrder}
      />
    </div>
  );
}
