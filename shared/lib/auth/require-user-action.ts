'use server';

import { cookies } from 'next/headers';
import { prisma } from '@/prisma/prisma-client';
import { verifyAccessToken } from '@/shared/lib/auth-tokens';

export async function requireUserAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    throw new Error('Unauthorized');
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      tenantId: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}
