'use client';

import { DeviceSession } from '@/shared/types/device-session';

interface UserDevicesTableProps {
  sessions: DeviceSession[];
}

export function UserDevicesTable({ sessions }: UserDevicesTableProps) {
  if (sessions.length === 0) {
    return (
      <p className='text-sm text-muted-foreground'>Нет активных устройств.</p>
    );
  }

  return (
    <div className='border rounded-md'>
      <table className='w-full text-sm'>
        <thead>
          <tr className='border-b bg-muted/50'>
            <th className='text-left px-3 py-2'>Устройство</th>
            <th className='text-left px-3 py-2'>IP</th>
            <th className='text-left px-3 py-2'>Дата входа</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr
              key={s.id}
              className='border-b last:border-0'>
              <td className='px-3 py-2'>
                {s.userAgent ?? 'Неизвестное устройство'}
              </td>
              <td className='px-3 py-2'>{s.ip ?? '—'}</td>
              <td className='px-3 py-2'>
                {new Date(s.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
