'use client';

export function UsersPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className='flex items-center gap-4 mt-4'>
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className='px-3 py-1 border rounded disabled:opacity-50'>
        Назад
      </button>

      <span>
        Страница {page} из {totalPages}
      </span>

      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className='px-3 py-1 border rounded disabled:opacity-50'>
        Вперёд
      </button>
    </div>
  );
}
