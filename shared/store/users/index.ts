import { create } from 'zustand';

import { createFiltersSlice, FiltersSlice } from './filters';
import { createSortingSlice, SortingSlice } from './sorting';
import { createPaginationSlice, PaginationSlice } from './pagination';
import { createSelectionSlice, SelectionSlice } from './selection';
import { createActionsSlice, ActionsSlice } from './actions';

export const useUsersStore = create<
  FiltersSlice & SortingSlice & PaginationSlice & SelectionSlice & ActionsSlice
>()((...a) => ({
  ...createFiltersSlice(...a),
  ...createSortingSlice(...a),
  ...createPaginationSlice(...a),
  ...createSelectionSlice(...a),
  ...createActionsSlice(...a),
}));
