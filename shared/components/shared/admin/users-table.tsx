'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { SortDirection, SortField } from '@/shared/lib/sort-users';
import { UserAvatar } from './user-avatar';
import { UserProviderBadge } from './user-provider-badge';

type UserRow = {
  id: number;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
  devices: number;
  banned: boolean;
  provider?: string | null;
};

export function UsersTable({
  users,
  onDelete,
  onBan,
  onUnban,
  onSort,
  sortField,
  sortDirection,
  selected,
  onToggle,
  onToggleAll,
  onProfile,
}: {
  users: UserRow[];
  onDelete: (id: number) => void;
  onBan: (id: number) => void;
  onUnban: (id: number) => void;
  onSort: (field: SortField) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  selected: number[];
  onToggle: (id: number) => void;
  onToggleAll: () => void;
  onProfile: (id: number) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <input
              type='checkbox'
              checked={users.length > 0 && selected.length === users.length}
              onChange={onToggleAll}
            />
          </TableHead>

          <TableHead
            onClick={() => onSort('id')}
            className='cursor-pointer'>
            ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
          </TableHead>

          <TableHead>Avatar</TableHead>

          <TableHead
            onClick={() => onSort('email')}
            className='cursor-pointer'>
            Email{' '}
            {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
          </TableHead>

          <TableHead>Provider</TableHead>

          <TableHead
            onClick={() => onSort('role')}
            className='cursor-pointer'>
            Role {sortField === 'role' && (sortDirection === 'asc' ? '↑' : '↓')}
          </TableHead>

          <TableHead
            onClick={() => onSort('createdAt')}
            className='cursor-pointer'>
            Created{' '}
            {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
          </TableHead>

          <TableHead
            onClick={() => onSort('updatedAt')}
            className='cursor-pointer'>
            Updated{' '}
            {sortField === 'updatedAt' && (sortDirection === 'asc' ? '↑' : '↓')}
          </TableHead>

          <TableHead
            onClick={() => onSort('lastLogin')}
            className='cursor-pointer'>
            Last Login{' '}
            {sortField === 'lastLogin' && (sortDirection === 'asc' ? '↑' : '↓')}
          </TableHead>

          <TableHead
            onClick={() => onSort('devices')}
            className='cursor-pointer'>
            Devices{' '}
            {sortField === 'devices' && (sortDirection === 'asc' ? '↑' : '↓')}
          </TableHead>

          <TableHead
            onClick={() => onSort('banned')}
            className='cursor-pointer'>
            Статус
            {sortField === 'banned' && (sortDirection === 'asc' ? '↑' : '↓')}
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {users.map((u) => (
          <TableRow key={u.id}>
            <TableCell>
              <input
                type='checkbox'
                checked={selected.includes(u.id)}
                onChange={() => onToggle(u.id)}
              />
            </TableCell>

            <TableCell>{u.id}</TableCell>
            <TableCell>
              <UserAvatar
                email={u.email}
                provider={u.provider}
              />
            </TableCell>
            <TableCell>{u.email}</TableCell>
            <TableCell>
              <UserProviderBadge provider={u.provider} />
            </TableCell>
            <TableCell>{u.role}</TableCell>
            <TableCell>{new Date(u.createdAt).toLocaleString()}</TableCell>
            <TableCell>{new Date(u.updatedAt).toLocaleString()}</TableCell>
            <TableCell>
              {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : '—'}
            </TableCell>
            <TableCell>{u.devices}</TableCell>
            <TableCell className={u.banned ? 'text-red-600' : 'text-green-600'}>
              {u.banned ? 'Заблокирован' : 'Активен'}
            </TableCell>

            <TableCell className='flex gap-2'>
              <button
                onClick={() => onProfile(u.id)}
                className='text-blue-600'>
                Профиль
              </button>
              {u.banned ? (
                <button
                  onClick={() => onUnban(u.id)}
                  className='text-green-600'>
                  Разбанить
                </button>
              ) : (
                <button
                  onClick={() => onBan(u.id)}
                  className='text-red-600'>
                  Забанить
                </button>
              )}

              <button
                onClick={() => onDelete(u.id)}
                className='text-red-600'>
                Удалить
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
