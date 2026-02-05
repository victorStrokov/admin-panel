import type { Order } from '@prisma/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui';
import { SORT_BY, SORT_DIR } from '@/shared/hooks/useOrderFilters';

type SortBy = (typeof SORT_BY)[keyof typeof SORT_BY];
type SortDir = (typeof SORT_DIR)[keyof typeof SORT_DIR];

type OrdersFiltersProps = {
  statusFilter: string;
  setStatusFilter: (value: string) => void;

  search: string;
  setSearch: (value: string) => void;

  sortBy: SortBy;
  setSortBy: (value: SortBy) => void;

  sortDir: SortDir;
  setSortDir: (value: SortDir) => void;

  dateFrom: string;
  setDateFrom: (value: string) => void;

  dateTo: string;
  setDateTo: (value: string) => void;

  selectedIds: number[];
  bulkUpdateStatus: (status: Order['status']) => Promise<void> | void;

  exportCSV: () => void;
};

export function OrdersFilters({
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
  selectedIds,
  bulkUpdateStatus,
  exportCSV,
}: OrdersFiltersProps) {
  return (
    <div className='flex items-center gap-4 flex-wrap'>
      <Select
        value={statusFilter}
        onValueChange={setStatusFilter}>
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

      <input
        type='text'
        placeholder='Поиск: имя, телефон, email'
        className='border rounded px-3 py-2 w-80'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Select
        value={sortBy}
        onValueChange={(value: SortBy) => setSortBy(value)}>
        <SelectTrigger className='w-36'>
          <SelectValue placeholder='Сортировка' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={SORT_BY.DATE}>Дата</SelectItem>
          <SelectItem value={SORT_BY.AMOUNT}>Сумма</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={sortDir}
        onValueChange={(value: SortDir) => setSortDir(value)}>
        <SelectTrigger className='w-20'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={SORT_DIR.ASC}>↑</SelectItem>
          <SelectItem value={SORT_DIR.DESC}>↓</SelectItem>
        </SelectContent>
      </Select>

      {selectedIds.length > 0 && (
        <div className='flex items-center gap-4 p-3 bg-muted rounded'>
          <span>Выбрано: {selectedIds.length}</span>
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
  );
}
