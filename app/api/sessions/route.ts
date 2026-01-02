import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';
import { verifyAccessToken } from '@/shared/lib/auth-tokens';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const sessions = await prisma.session.findMany({
      where: { userId: payload.userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        deviceId: true,
        userAgent: true,
        ip: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ sessions });
  } catch (e) {
    console.error('[SESSIONS_GET]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
