'use client';

import { useEffect, useState } from 'react';
import { getOrCreateDeviceId } from '@/shared/lib/device-id';
import { logoutAll } from '@/shared/lib/logout-all';
import { deleteOthers } from '@/shared/lib/delete-others';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { parseUserAgent } from '@/shared/lib/parse-user-agent';
import { getDeviceIcon } from '@/shared/lib/get-device-icon';
import { getGeo } from '@/shared/lib/get-geo';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { getBrowserIcon } from '@/shared/lib/get-browser-icon';

type SessionClient = {
  id: string;
  deviceId: string | null;
  userAgent: string | null;
  ip: string | null;
  createdAt: string;
  updatedAt: string;
  geo?: {
    city: string;
    region: string;
    country: string;
  } | null;
};

export default function DevicesPage() {
  const [sessions, setSessions] = useState<SessionClient[]>([]);
  const deviceId = getOrCreateDeviceId();
  const router = useRouter();

  async function loadSessions() {
    const res = await fetch('/api/sessions', { credentials: 'include' });
    const data = await res.json();

    const sessionsWithGeo = await Promise.all(
      data.sessions.map(async (s: SessionClient) => ({
        ...s,
        geo: await getGeo(s.ip),
      }))
    );

    setSessions(sessionsWithGeo);
  }

  async function deleteSession(id: string) {
    await fetch('/api/sessions/delete', {
      method: 'POST',
      body: JSON.stringify({ sessionId: id }),
    });
    loadSessions();
  }

  useEffect(() => {
    Promise.resolve().then(() => loadSessions());

    const handler = () => loadSessions();
    window.addEventListener('session-changed', handler);

    return () => window.removeEventListener('session-changed', handler);
  }, []);

  return (
    <div className='p-6 space-y-4'>
      <h1 className='text-2xl font-bold'>Активные устройства</h1>

      <div className='flex items-center gap-4'>
        <button
          onClick={async () => {
            const ok = await deleteOthers();
            if (ok) {
              toast.success('Все другие устройства завершены');
              loadSessions();
            } else {
              toast.error('Ошибка при завершении других устройств');
            }
          }}
          className='text-red-600 border border-red-600 px-3 py-1 rounded hover:bg-red-600 hover:text-white transition duration-300 cursor-pointer'>
          Завершить все, кроме текущего
        </button>

        <button
          onClick={async () => {
            await logoutAll();
            router.push('/login?all=1');
          }}
          className='text-red-600 border border-red-600 px-3 py-1 rounded hover:bg-red-600 hover:text-white transition duration-300 cursor-pointer'>
          Выйти на всех устройствах
        </button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Устройство</TableHead>
            <TableHead>Браузер</TableHead>
            <TableHead>IP</TableHead>
            <TableHead>Гео</TableHead>
            <TableHead>Активность</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {sessions.map((s) => {
            const { os, browser } = parseUserAgent(s.userAgent);

            return (
              <TableRow key={s.id}>
                <TableCell className='flex items-center gap-2'>
                  {getDeviceIcon(os)}
                  {os}
                </TableCell>

                <TableCell className='flex items-center gap-2'>
                  {getBrowserIcon(browser)}
                  {browser}
                </TableCell>

                <TableCell>{s.ip}</TableCell>

                <TableCell>
                  {s.geo ? `${s.geo.city}, ${s.geo.country}` : '—'}
                </TableCell>

                <TableCell>{new Date(s.updatedAt).toLocaleString()}</TableCell>

                <TableCell>
                  {s.deviceId !== deviceId && (
                    <button
                      onClick={() => deleteSession(s.id)}
                      className='text-red-600'>
                      Завершить
                    </button>
                  )}

                  {s.deviceId === deviceId && (
                    <span className='text-green-600'>Текущее устройство</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
//  TODO:
// 1) Флаги стран (🇷🇺 🇺🇸 🇩🇪)
// 2) “X минут назад” вместо даты
// 3) Skeleton‑loading
// 4) Цветные иконки браузеров (Chrome, Firefox, Edge, Safari)
// 5) Tooltip с подробностями устройства
// 6) Определение типа устройства (desktop / mobile / tablet)
