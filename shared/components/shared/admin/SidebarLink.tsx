'use client';

import Link from 'next/link';
import { cn } from '@/shared/lib/utils';
import { usePathname } from 'next/navigation';

export function SidebarLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        'block transition-colors',
        active ? 'text-blue-400 font-bold' : 'hover:text-blue-400'
      )}>
      {children}
    </Link>
  );
}
