'use client';

import { cn } from '@/shared/lib/utils';
import { useAuth } from '@/shared/hooks/use-auth';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { silentRefresh } from '@/shared/lib/refresh';
import React from 'react';
import { logout } from '@/shared/lib/logout';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  //  Silent refresh каждые 10 минут
  React.useEffect(() => {
    // Первый вызов сразу при загрузке
    silentRefresh();

    // Затем каждые 10 минут
    const interval = setInterval(() => {
      silentRefresh();
    }, 1000 * 60 * 10);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className='p-8'>Проверка авторизации...</div>;
  }

  return (
    <div className='flex min-h-screen'>
      {/* Sidebar */}
      <aside className={cn('w-64 bg-gray-900 text-white p-6 space-y-4')}>
        <h2 className='text-xl font-bold mb-6'>Admin Panel</h2>
        <nav className='space-y-2'>
          <Link
            href='/admin/products'
            className={cn(
              'block',
              pathname === '/admin/products'
                ? 'text-blue-400 font-bold'
                : 'hover:text-blue-400'
            )}>
            Products
          </Link>
          <Link
            href='/admin/orders'
            className={cn(
              'block',
              pathname === '/admin/orders'
                ? 'text-blue-400 font-bold'
                : 'hover:text-blue-400'
            )}>
            Orders
          </Link>
          <Link
            href='/admin/users'
            className={cn(
              'block',
              pathname === '/admin/users'
                ? 'text-blue-400 font-bold'
                : 'hover:text-blue-400'
            )}>
            Users
          </Link>
          <Link
            href='/admin/inventory'
            className={cn(
              'block',
              pathname === '/admin/inventory'
                ? 'text-blue-400 font-bold'
                : 'hover:text-blue-400'
            )}>
            Inventory
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className='flex-1 bg-gray-50 p-8'>
        <header className='flex justify-between items-center mb-6'>
          <h1 className='text-lg font-semibold'>Админка</h1>
          <button
            onClick={async () => {
              await logout();
              router.push('/login');
            }}
            className='text-red-600 border border-red-600 px-3 py-1 rounded hover:bg-red-600 hover:text-white transition duration-300 cursor-pointer'>
            Выйти
          </button>
        </header>
        {children}
      </main>
    </div>
  );
}
