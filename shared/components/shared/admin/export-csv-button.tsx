'use client';

export type UserCsvRow = {
  id: number;
  email: string;
  role: string;
  banned: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
  provider?: string | null;
};

export function ExportCsvButton({ users }: { users: UserCsvRow[] }) {
  function exportCsv() {
    if (!users.length) return;

    const headers = Object.keys(users[0]) as (keyof UserCsvRow)[];
    const rows = users.map((u) =>
      headers.map((h) => JSON.stringify(u[h] ?? '')).join(',')
    );

    const csv = [headers.join(','), ...rows].join('\n');

    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();

    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={exportCsv}
      className='px-4 py-2 bg-blue-600 text-white rounded'>
      Экспорт CSV
    </button>
  );
}
