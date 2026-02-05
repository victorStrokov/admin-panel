import { notFound } from 'next/navigation';
import { headers, cookies } from 'next/headers';
import { UserAvatar, UserProviderBadge } from '@/shared/components';
import { ActivityLogRow } from '@/shared/types/activity-log';
import { DeviceSession } from '@/shared/types/device-session';
import { UserDevicesTable } from '@/shared/components/shared/users';

export default async function UserProfilePage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { id } = params;

  const h = await headers();
  const host = h.get('host');
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  const res = await fetch(`${baseUrl}/api/users/${id}`, {
    cache: 'no-store',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) return notFound();

  const data = await res.json();
  const user = data.user;
  const activityRes = await fetch(`${baseUrl}/api/users/${id}/activity`, {
    cache: 'no-store',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const activity: ActivityLogRow[] = await activityRes.json();
  const devicesRes = await fetch(`${baseUrl}/api/users/${id}/devices`, {
    cache: 'no-store',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const devices: DeviceSession[] = await devicesRes.json();

  return (
    <div className='p-6 space-y-6'>
      <h1 className='text-2xl font-bold'>Профиль пользователя</h1>

      <div className='flex items-center gap-4'>
        <UserAvatar
          email={user.email}
          provider={user.provider}
          size={64}
        />
        <div>
          <div className='text-xl font-semibold'>{user.email}</div>
          <UserProviderBadge provider={user.provider} />
        </div>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div>
          <h2 className='font-semibold'>Основная информация</h2>
          <p>ID: {user.id}</p>
          <p>Роль: {user.role}</p>
          <p>Статус: {user.status}</p>
        </div>

        <div>
          <h2 className='font-semibold'>Даты</h2>
          <p>Создан: {new Date(user.createdAt).toLocaleString()}</p>
          <p>Обновлён: {new Date(user.updatedAt).toLocaleString()}</p>
          <p>
            Последний вход:{' '}
            {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '—'}
          </p>
        </div>
      </div>

      <div>
        <h2 className='font-semibold mb-2'>Устройства</h2>
        <UserDevicesTable sessions={devices} />
      </div>
      <div>
        <h2 className='font-semibold mb-2'>Активность</h2>
        {activity.length === 0 ? (
          <p className='text-sm text-muted-foreground'>
            Нет записей активности.
          </p>
        ) : (
          <ul className='list-disc pl-6 space-y-1'>
            {activity.map((log: ActivityLogRow) => (
              <li key={log.id}>
                [{new Date(log.createdAt).toLocaleString()}] {log.action}
                {log.ip && <> — IP: {log.ip}</>}
                {log.userAgent && <> — {log.userAgent}</>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
