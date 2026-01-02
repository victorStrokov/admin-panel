'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getOrCreateDeviceId } from '@/shared/lib/device-id';
import { silentRefresh } from '@/shared/lib/refresh';

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      const deviceId = getOrCreateDeviceId();

      // 1. Первый запрос /api/me
      let res = await fetch('/api/me', {
        credentials: 'include',
        headers: {
          'x-device-id': deviceId,
        },
      });

      // 2. Если accessToken истёк → пробуем refresh
      if (res.status === 401) {
        const refreshed = await silentRefresh();

        if (!refreshed) {
          router.push('/login');
          return;
        }

        // 3. Повторный запрос /api/me
        res = await fetch('/api/me', {
          credentials: 'include',
          headers: {
            'x-device-id': deviceId,
          },
        });
      }

      // 4. Если после refresh всё равно ошибка → login
      if (!res.ok) {
        router.push('/login');
        return;
      }

      // 5. Всё ок → сохраняем пользователя
      const data = await res.json();
      if (isMounted) {
        setUser(data.user);
        setLoading(false);
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return { loading, user };
}
