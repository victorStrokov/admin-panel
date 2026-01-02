import { prisma } from '@/prisma/prisma-client';

export type ActivityAction =
  | 'login'
  | 'logout'
  | 'refresh'
  | 'ban'
  | 'unban'
  | 'delete_user'
  | 'update_user';

export async function logActivity(
  userId: number,
  action: string,
  req?: Request
) {
  try {
    const ip =
      req?.headers.get('x-forwarded-for') ||
      req?.headers.get('x-real-ip') ||
      null;

    const userAgent = req?.headers.get('user-agent') || null;

    await prisma.activityLog.create({
      data: {
        userId,
        action,
        ip,
        userAgent,
      },
    });
  } catch (error) {
    console.error('[ActivityLog] Error:', error);
  }
}
