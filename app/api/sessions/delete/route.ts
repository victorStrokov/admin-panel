import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';
import { verifyAccessToken } from '@/shared/lib/auth-tokens';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { sessionId } = await req.json();

    await prisma.session.delete({
      where: { id: sessionId },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[SESSION_DELETE]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
