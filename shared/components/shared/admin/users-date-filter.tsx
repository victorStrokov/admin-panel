'use client';

export function UsersDateFilter({
  from,
  to,
  onChangeFrom,
  onChangeTo,
}: {
  from: string;
  to: string;
  onChangeFrom: (v: string) => void;
  onChangeTo: (v: string) => void;
}) {
  return (
    <div className='flex items-center gap-2'>
      <input
        type='date'
        value={from}
        onChange={(e) => onChangeFrom(e.target.value)}
        className='border px-3 py-2 rounded'
      />

      <span>—</span>

      <input
        type='date'
        value={to}
        onChange={(e) => onChangeTo(e.target.value)}
        className='border px-3 py-2 rounded'
      />
    </div>
  );
}
