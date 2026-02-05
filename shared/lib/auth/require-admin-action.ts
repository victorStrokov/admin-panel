'use server';

import { requireUserAction } from './require-user-action';

export async function requireAdminAction() {
  const user = await requireUserAction();

  if (user.role !== 'ADMIN') {
    throw new Error('Forbidden');
  }

  return user;
}
