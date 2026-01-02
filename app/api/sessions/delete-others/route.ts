import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';
import { verifyAccessToken } from '@/shared/lib/auth-tokens';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const currentDeviceId = req.headers.get('x-device-id');

    if (!token || !currentDeviceId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await prisma.session.deleteMany({
      where: {
        userId: payload.userId,
        deviceId: { not: currentDeviceId },
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[SESSION_DELETE_OTHERS]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
