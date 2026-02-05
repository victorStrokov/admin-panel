'use client';

export function UsersSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type='text'
      placeholder='Поиск по email...'
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className='border px-3 py-2 rounded w-full max-w-sm'
    />
  );
}
