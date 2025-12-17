'use client';

import { cn } from '@/lib/utils';
import { useAuth } from '@/shared/hooks/use-auth';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

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
            onClick={() => {
              document.cookie = 'token=; Max-Age=0; path=/'; // очистка токена
              router.push('/login');
            }}
            className='bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700'>
            Выйти
          </button>
        </header>
        {children}
      </main>
    </div>
  );
}
