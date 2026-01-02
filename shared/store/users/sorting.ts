import { StateCreator } from 'zustand';
import { SortField, SortDirection } from '@/shared/lib/sort-users';

export interface SortingSlice {
  sortField: SortField;
  sortDirection: SortDirection;

  setSort: (field: SortField) => void;
}

export const createSortingSlice: StateCreator<SortingSlice> = (set, get) => ({
  sortField: 'id',
  sortDirection: 'asc',

  setSort: (field) => {
    const { sortField, sortDirection } = get();
    if (sortField === field) {
      set({ sortDirection: sortDirection === 'asc' ? 'desc' : 'asc' });
    } else {
      set({ sortField: field, sortDirection: 'asc' });
    }
  },
});
