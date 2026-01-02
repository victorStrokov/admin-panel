import { UserRow } from '@/shared/types/user-row';
import { StateCreator } from 'zustand';

export interface ActionsSlice {
  users: UserRow[];
  loading: boolean;

  deleteId: number | null;
  banId: number | null;

  setDeleteId: (id: number | null) => void;
  setBanId: (id: number | null) => void;

  loadUsers: () => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  banUser: (id: number) => Promise<void>;
  unbanUser: (id: number) => Promise<void>;
}

export const createActionsSlice: StateCreator<ActionsSlice> = (set, get) => ({
  users: [],
  loading: false,

  deleteId: null,
  banId: null,

  setDeleteId: (id) => set({ deleteId: id }),
  setBanId: (id) => set({ banId: id }),

  loadUsers: async () => {
    set({ loading: true });
    const res = await fetch('/api/users');
    const data = await res.json();
    set({ users: data.users, loading: false });
  },

  deleteUser: async (id) => {
    // оптимистичное обновление
    const prev = get().users;
    set({ users: prev.filter((u) => u.id !== id) });

    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });

    if (!res.ok) {
      set({ users: prev }); // откат
    }
  },

  banUser: async (id) => {
    const prev = get().users;
    set({
      users: prev.map((u) => (u.id === id ? { ...u, status: 'banned' } : u)),
    });

    const res = await fetch(`/api/users/${id}/ban`, { method: 'POST' });

    if (!res.ok) {
      set({ users: prev });
    }
  },

  unbanUser: async (id) => {
    const prev = get().users;
    set({
      users: prev.map((u) => (u.id === id ? { ...u, status: 'active' } : u)),
    });

    const res = await fetch(`/api/users/${id}/unban`, { method: 'POST' });
    const data = await res.json();

    if (!res.ok) {
      set({ users: prev });
    }

    if (data.tempPassword) {
      alert(`Временный пароль: ${data.tempPassword}`);
    }
  },
});
