'use client';

export function UsersStatusFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className='border px-3 py-2 rounded'>
      <option value=''>Все статусы</option>
      <option value='active'>Активные</option>
      <option value='banned'>Заблокированные</option>
    </select>
  );
}
