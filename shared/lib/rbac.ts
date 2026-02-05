import { NextRequest } from 'next/server';
import { getUserFromRequest } from './get-user';

type Role = 'USER' | 'MANAGER' | 'ADMIN';

const permissions = {
  manageProducts: ['ADMIN', 'MANAGER'] as Role[],
  manageUsers: ['ADMIN'] as Role[],
  viewAllOrders: ['ADMIN', 'MANAGER'] as Role[],
  viewOwnOrders: ['USER', 'MANAGER', 'ADMIN'] as Role[],
};

export async function requireRole(req: NextRequest, allowed: Role[]) {
  const user = await getUserFromRequest(req);
  if (!user) return null;

  if (!allowed.includes(user.role as Role)) return null;

  return user;
}

export const allow = {
  admin: (req: NextRequest) => requireRole(req, ['ADMIN']),
  manager: (req: NextRequest) => requireRole(req, ['MANAGER']),
  staff: (req: NextRequest) => requireRole(req, ['ADMIN', 'MANAGER']),
  anyUser: (req: NextRequest) => requireRole(req, ['USER', 'MANAGER', 'ADMIN']),
  manageProducts: (req: NextRequest) =>
    requireRole(req, permissions.manageProducts),
  manageUsers: (req: NextRequest) => requireRole(req, permissions.manageUsers),
  viewAllOrders: (req: NextRequest) =>
    requireRole(req, permissions.viewAllOrders),
};
