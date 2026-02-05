'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
} from 'react';
import { useRouter } from 'next/navigation';
import { getOrCreateDeviceId } from '@/shared/lib/device-id';
import { AUTH_REFRESH_EVENT } from '@/shared/lib/refresh-auth';
import type { User } from '@/@types/base.types';

interface AuthContextType {
  loading: boolean;
  user: User | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const hasRedirected = useRef(false);
  const hasChecked = useRef(false);
  const checkInProgressRef = useRef(false);

  // Функция для загрузки профиля
  async function loadProfile() {
    try {
      const deviceId = getOrCreateDeviceId();

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
        setLoading(false);
        return user;
      } else if (res.status === 401) {
        // Если 401 - пользователь не авторизован
        setUser(null);
        setLoading(false);

        // Редиректим на login
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          router.replace('/login');
        }
      } else {
        // Другие ошибки - не редиректим, просто логируем
        console.error('[AuthProvider] Auth check failed with status:', res.status);
        setUser(null);
        setLoading(false);
      }
    } catch (error) {
      console.error('[AuthProvider] Auth check error:', error);
      setUser(null);
      setLoading(false);
    } finally {
      checkInProgressRef.current = false;
    }
  }

  useEffect(() => {
    // Если уже проверили или проверка в процессе, не делаем ничего
    if (hasChecked.current || checkInProgressRef.current) return;

    // Если мы на странице логина, не проверяем авторизацию
    if (
      typeof window !== 'undefined' &&
      window.location.pathname.startsWith('/login')
    ) {
      hasChecked.current = true;
      setLoading(false);
      return;
    }

    hasChecked.current = true;
    checkInProgressRef.current = true;

    // Выполняем load только один раз при монтировании
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Слушаем события сессии (logout и login)
  useEffect(() => {
    function handleSessionChange() {
      setUser(null);
      hasRedirected.current = false;
      router.replace('/login');
    }

    function handleAuthRefresh() {
      // Перезагружаем профиль при входе
      hasChecked.current = false;
      checkInProgressRef.current = false;
      setLoading(true);
      loadProfile();
    }

    window.addEventListener('session-changed', handleSessionChange);
    window.addEventListener(AUTH_REFRESH_EVENT, handleAuthRefresh);
    
    return () => {
      window.removeEventListener('session-changed', handleSessionChange);
      window.removeEventListener(AUTH_REFRESH_EVENT, handleAuthRefresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ loading, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
