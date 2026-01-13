import { headers } from 'next/headers';

export async function getBaseUrl() {
  // 1. Серверная переменная окружения (лучший вариант)
  if (process.env.SITE_URL) {
    return process.env.SITE_URL;
  }

  // 2. Клиентская переменная окружения
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  // 3. SSR fallback — корректно работает за прокси
  const h = await headers();

  const proto = h.get('x-forwarded-proto') ?? 'http';

  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';

  return `${proto}://${host}`;
}
