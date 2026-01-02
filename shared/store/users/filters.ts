import { StateCreator } from 'zustand';

export interface FiltersSlice {
  search: string;
  roleFilter: string;
  statusFilter: string;
  dateFrom: string;
  dateTo: string;

  setSearch: (v: string) => void;
  setRoleFilter: (v: string) => void;
  setStatusFilter: (v: string) => void;
  setDateFrom: (v: string) => void;
  setDateTo: (v: string) => void;
}

export const createFiltersSlice: StateCreator<FiltersSlice> = (set) => ({
  search: '',
  roleFilter: '',
  statusFilter: '',
  dateFrom: '',
  dateTo: '',

  setSearch: (v) => set({ search: v }),
  setRoleFilter: (v) => set({ roleFilter: v }),
  setStatusFilter: (v) => set({ statusFilter: v }),
  setDateFrom: (v) => set({ dateFrom: v }),
  setDateTo: (v) => set({ dateTo: v }),
});
