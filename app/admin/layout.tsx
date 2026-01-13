'use client';

import { SidebarLink } from '@/shared/components';
import { useAuth } from '@/shared/context/AuthContext';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function AdminLayout({ children }) {
  const { loading, user } = useAuth();
  const router = useRouter();
  const [redirected, setRedirected] = React.useState(false);

  React.useEffect(() => {
    if (!loading && user?.role !== 'ADMIN' && !redirected) {
      setRedirected(true);
      router.push('/');
    }
  }, [loading, user, router, redirected]);

  if (loading) {
    return <div className='p-8'>Проверка авторизации...</div>;
  }

  if (user?.role !== 'ADMIN') {
    return <div className='p-8'>Проверка доступа...</div>;
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
