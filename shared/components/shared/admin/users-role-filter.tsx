'use client';

export function UsersRoleFilter({
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
      <option value=''>Все роли</option>
      <option value='USER'>USER</option>
      <option value='ADMIN'>ADMIN</option>
      <option value='MANAGER'>MANAGER</option>
    </select>
  );
}
