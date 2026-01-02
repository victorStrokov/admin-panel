'use client';

import {
  UsersPagination,
  UsersRoleFilter,
  UsersSearch,
  UsersStatusFilter,
  UsersTable,
  ConfirmDialog,
  UsersPerPage,
} from '@/shared/components';

import { UsersDateFilter, ExportCsvButton } from '@/shared/components/shared/';
import { useUsersStore } from '@/shared/store/users';
import { useRouter } from 'next/navigation';
import { useUsersQuery } from '@/shared/api/users/use-users-query';
import { useUserMutations } from '@/shared/api/users/use-user-mutations';

export default function UsersPage() {
  const router = useRouter();

  // Мутации
  const { deleteUser, banUser, unbanUser } = useUserMutations();

  // UI состояние из Zustand
  const {
    search,
    roleFilter,
    statusFilter,
    dateFrom,
    dateTo,
    sortField,
    sortDirection,
    page,
    perPage,
    selected,
    deleteId,
    banId,

    setSearch,
    setRoleFilter,
    setStatusFilter,
    setDateFrom,
    setDateTo,
    setSort,
    setPage,
    setPerPage,
    toggleSelect,
    toggleSelectAll,
    setDeleteId,
    setBanId,
  } = useUsersStore();

  // Данные из React Query
  const { data, isLoading } = useUsersQuery({
    page,
    perPage,
    sort: sortField,
    dir: sortDirection,
    role: roleFilter,
    status: statusFilter,
    search,
    dateFrom,
    dateTo,
  });

  const users = data?.users ?? [];
  const total = data?.total ?? 0;

  const totalPages = perPage === 0 ? 1 : Math.ceil(total / perPage);

  if (isLoading) {
    return (
      <div className='p-6'>
        <div className='animate-pulse space-y-4'>
          <div className='h-6 bg-gray-300 rounded w-1/3' />
          <div className='h-10 bg-gray-200 rounded' />
          <div className='h-10 bg-gray-200 rounded' />
          <div className='h-10 bg-gray-200 rounded' />
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 space-y-4'>
      <h1 className='text-2xl font-bold'>Пользователи</h1>

      <div className='flex gap-4 flex-wrap'>
        <UsersSearch
          value={search}
          onChange={setSearch}
        />
        <UsersRoleFilter
          value={roleFilter}
          onChange={setRoleFilter}
        />
        <UsersStatusFilter
          value={statusFilter}
          onChange={setStatusFilter}
        />
        <UsersDateFilter
          from={dateFrom}
          to={dateTo}
          onChangeFrom={setDateFrom}
          onChangeTo={setDateTo}
        />
        <UsersPerPage
          value={perPage}
          onChange={setPerPage}
        />

        <ExportCsvButton users={users} />
      </div>

      {selected.length > 0 && (
        <button
          onClick={() => setDeleteId(-1)}
          className='px-4 py-2 bg-red-600 text-white rounded'>
          Удалить выбранных ({selected.length})
        </button>
      )}

      <UsersTable
        users={users}
        selected={selected}
        onToggle={toggleSelect}
        onToggleAll={() => toggleSelectAll(users.map((u) => u.id))}
        onDelete={(id) => setDeleteId(id)}
        onBan={(id) => setBanId(id)}
        onUnban={(id) => unbanUser.mutate(id)}
        onSort={setSort}
        sortField={sortField}
        sortDirection={sortDirection}
        onProfile={(id) => router.push(`/admin/users/${id}`)}
      />

      {/* Модалка удаления */}
      <ConfirmDialog
        open={deleteId !== null}
        title={
          deleteId === -1
            ? 'Удалить выбранных пользователей?'
            : 'Удалить пользователя?'
        }
        description='Это действие нельзя отменить.'
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId === -1) {
            await fetch('/api/users/delete-many', {
              method: 'POST',
              body: JSON.stringify({ ids: selected }),
            });
          } else if (deleteId !== null) {
            deleteUser.mutate(deleteId);
          }

          setDeleteId(null);
        }}
      />

      {/* Модалка блокировки */}
      <ConfirmDialog
        open={banId !== null}
        title='Заблокировать пользователя?'
        description='Пользователь потеряет доступ.'
        onCancel={() => setBanId(null)}
        onConfirm={() => {
          if (banId !== null) banUser.mutate(banId);
          setBanId(null);
        }}
      />

      <UsersPagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
