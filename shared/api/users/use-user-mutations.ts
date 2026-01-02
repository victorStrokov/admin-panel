import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UsersResponse } from './use-users-query';

export function useUserMutations() {
  const qc = useQueryClient();

  const deleteUser = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const banUser = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/users/${id}/ban`, { method: 'POST' });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const unbanUser = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/users/${id}/unban`, { method: 'POST' });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteMany = useMutation({
    mutationFn: async (ids: number[]) => {
      await fetch('/api/users/delete-many', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      });
    },
    onMutate: async (ids) => {
      await qc.cancelQueries({ queryKey: ['users'] });

      const prev = qc.getQueryData(['users']);

      qc.setQueryData<UsersResponse>(['users'], (old) => {
        if (!old) return old;
        return {
          ...old,
          users: old.users.filter((u) => !ids.includes(u.id)),
          total: old.total - ids.length,
        };
      });

      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['users'], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return { deleteUser, banUser, unbanUser, deleteMany };
}
