import { UserRow } from '../types/user-row';

export type SortField =
  | 'id'
  | 'email'
  | 'role'
  | 'createdAt'
  | 'updatedAt'
  | 'lastLogin'
  | 'devices'
  | 'banned';

export type SortDirection = 'asc' | 'desc';

export function sortUsers(
  users: UserRow[],
  field: SortField,
  direction: SortDirection
) {
  return [...users].sort((a, b) => {
    const x = a[field];
    const y = b[field];

    if (x === null) return 1;
    if (y === null) return -1;

    if (typeof x === 'string') {
      return direction === 'asc'
        ? x.localeCompare(y as string)
        : (y as string).localeCompare(x);
    }

    if (typeof x === 'number') {
      return direction === 'asc' ? x - (y as number) : (y as number) - x;
    }

    return 0;
  });
}
