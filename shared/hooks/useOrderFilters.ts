import { useMemo, useState } from 'react';
import type { Order } from '@prisma/client';

export enum SORT_BY {
  DATE = 'date',
  AMOUNT = 'amount',
}
export type SortBy = (typeof SORT_BY)[keyof typeof SORT_BY];
export enum SORT_DIR {
  ASC = 'asc',
  DESC = 'desc',
}
export type SortDir = (typeof SORT_DIR)[keyof typeof SORT_DIR];
export function useOrderFilters(orders: Order[]) {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>(SORT_BY.DATE);
  const [sortDir, setSortDir] = useState<SortDir>(SORT_DIR.DESC);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

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

    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      result = result.filter((o) => new Date(o.createdAt).getTime() >= from);
    }

    if (dateTo) {
      const to = new Date(dateTo).getTime();
      result = result.filter((o) => new Date(o.createdAt).getTime() <= to);
    }

    result = result.sort((a, b) => {
      if (sortBy === SORT_BY.DATE) {
        const diff =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return sortDir === SORT_DIR.ASC ? diff : -diff;
      }

      if (sortBy === SORT_BY.AMOUNT) {
        const diff = a.totalAmount - b.totalAmount;
        return sortDir === SORT_DIR.ASC ? diff : -diff;
      }

      return 0;
    });

    return result;
  }, [orders, statusFilter, search, sortBy, sortDir, dateFrom, dateTo]);

  return {
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
  };
}
