import { prisma } from '@/prisma/prisma-client';

export async function logActivity(
  userId: number,
  action: string,
  req?: Request,
  meta?: Record<string, unknown>,
) {
  const start = performance.now();

  try {
    const ip =
      req?.headers.get('x-forwarded-for') ||
      req?.headers.get('x-real-ip') ||
      null;

    const userAgent = req?.headers.get('user-agent') || null;
    const requestId = req?.headers.get('x-request-id') || null;
    const method = req?.method || null;
    const url = req?.url || null;

    await prisma.activityLog.create({
      data: {
        userId,
        action,
        ip,
        userAgent,
        requestId,
        method,
        url,
        latencyMs: performance.now() - start,
        meta: meta ? JSON.stringify(meta) : null,
      },
    });
  } catch (error) {
    console.error('[ActivityLog] Error:', {
      error,
      action,
      userId,
      requestId: req?.headers.get('x-request-id'),
    });
  }
}
