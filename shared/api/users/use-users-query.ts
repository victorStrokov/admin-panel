import { UserRow } from '@/shared/types/user-row';
import { useQuery } from '@tanstack/react-query';

export type UsersResponse = {
  users: UserRow[];
  total: number;
};

type UsersQueryParams = {
  page: number;
  perPage: number;
  sort: string;
  dir: string;
  role: string;
  status: string;
  search: string;
  dateFrom: string;
  dateTo: string;
};

export function useUsersQuery(params: UsersQueryParams) {
  const query = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      acc[key] = String(value ?? '');
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  return useQuery<UsersResponse>({
    queryKey: ['users', params],
    queryFn: async () => {
      const res = await fetch(`/api/users?${query}`);
      return res.json();
    },
  });
}
