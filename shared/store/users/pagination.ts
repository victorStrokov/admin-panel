import { StateCreator } from 'zustand';

export interface PaginationSlice {
  page: number;
  perPage: number;

  setPage: (p: number) => void;
  setPerPage: (p: number) => void;
}

export const createPaginationSlice: StateCreator<PaginationSlice> = (set) => ({
  page: 1,
  perPage: 10,

  setPage: (p) => set({ page: p }),
  setPerPage: (p) => set({ perPage: p }),
});
