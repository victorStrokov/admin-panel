import { prisma } from '@/prisma/prisma-client';
import { verifyAccessToken } from '@/shared/lib/auth-tokens';
import { NextRequest } from 'next/server';
import { JwtPayload } from 'jsonwebtoken';

export async function getUserFromRequest(req: NextRequest) {
  try {
    const token =
      req.cookies.get('token')?.value ||
      req.headers.get('authorization')?.replace('Bearer ', '') ||
      '';

    if (!token) return null;

    const payload = verifyAccessToken(token) as JwtPayload & { userId: number };

    if (!payload?.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, tenantId: true },
    });

    return user;
  } catch {
    return null;
  }
}
