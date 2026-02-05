import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/shared/lib/get-current-user';
import { SidebarLink } from '@/shared/components';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireAdmin();

  if (!user) {
    redirect('/login');
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
