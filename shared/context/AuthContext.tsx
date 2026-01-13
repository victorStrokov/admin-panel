'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getOrCreateDeviceId } from '@/shared/lib/device-id';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function load() {
      const deviceId = getOrCreateDeviceId();

      try {
        const res = await fetch('/api/me', {
          credentials: 'include',
          headers: { 'x-device-id': deviceId },
        });

        if (res.ok) {
          const data = await res.json();
          // Normalize role to uppercase for client-side checks
          const user = data.user
            ? {
                ...data.user,
                role: data.user.role?.toUpperCase(),
                tenantId: data.user.tenantId,
              }
            : null;
          setUser(user);
        } else if (res.status === 401) {
          // Если 401 и находимся на защищенной странице, редирект на логин
          setUser(null);
          if (pathname?.startsWith('/admin')) {
            router.replace('/login');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <AuthContext.Provider value={{ loading, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
