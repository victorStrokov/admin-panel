'use client';

import { SidebarLink } from '@/shared/components';
import { useAuth } from '@/shared/context/AuthContext';
import { useRouter } from 'next/navigation';
import React from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { loading, user } = useAuth();
  const router = useRouter();
  const redirectedRef = React.useRef(false);

  React.useEffect(() => {
    // Если еще загружается, не делаем ничего
    if (loading) return;

    // Если пользователь не авторизован или не админ, редиректим
    if (!user || user.role !== 'ADMIN') {
      if (!redirectedRef.current) {
        redirectedRef.current = true;
        router.replace('/login');
      }
    }
  }, [loading, user, router]);

  // Пока загружается авторизация, показываем загрузку
  if (loading) {
    return <div className='p-8 flex items-center justify-center min-h-screen'>Загрузка...</div>;
  }

  // Если пользователь не авторизован или не админ, показываем сообщение
  if (!user || user.role !== 'ADMIN') {
    return <div className='p-8 flex items-center justify-center min-h-screen'>Доступ запрещен</div>;
  }

  return (
    <div className='flex min-h-screen'>
      <aside className='w-64 bg-gray-900 text-white p-6 space-y-4'>
        <h2 className='text-xl font-bold mb-6'>Admin Panel</h2>
        <nav className='space-y-2'>
          <SidebarLink href='/admin/products'>Products</SidebarLink>
          <SidebarLink href='/admin/orders'>Orders</SidebarLink>
          <SidebarLink href='/admin/users'>Users</SidebarLink>
          <SidebarLink href='/admin/inventory'>Inventory</SidebarLink>
        </nav>
      </aside>
      {children}
    </div>
  );
}
