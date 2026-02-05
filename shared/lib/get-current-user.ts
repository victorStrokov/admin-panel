import { cookies } from 'next/headers';
import { prisma } from '@/prisma/prisma-client';
import { verifyAccessToken } from './auth-tokens';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;

  const payload = verifyAccessToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}
