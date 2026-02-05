import { StateCreator } from 'zustand';

export interface SelectionSlice {
  selected: number[];

  toggleSelect: (id: number) => void;
  toggleSelectAll: (ids: number[]) => void;
}

export const createSelectionSlice: StateCreator<SelectionSlice> = (
  set,
  get
) => ({
  selected: [],

  toggleSelect: (id) => {
    const selected = get().selected;
    set({
      selected: selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id],
    });
  },

  toggleSelectAll: (ids) => {
    const selected = get().selected;
    if (selected.length === ids.length) {
      set({ selected: [] });
    } else {
      set({ selected: ids });
    }
  },
});
