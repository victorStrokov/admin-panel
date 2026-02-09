import { prisma } from '@/prisma/prisma-client';

export async function logInventoryChange({
  inventoryId,
  productItemId,
  tenantId,
  userId,
  oldQuantity,
  newQuantity,
  reason,
  requestId,
}: {
  inventoryId: number;
  productItemId: number;
  tenantId: number;
  userId?: number;
  oldQuantity: number;
  newQuantity: number;
  reason: string;
  requestId?: string;
}) {
  const change = newQuantity - oldQuantity;

  await prisma.inventoryLog.create({
    data: {
      inventoryId,
      productItemId,
      tenantId,
      userId,
      oldQuantity,
      newQuantity,
      change,
      reason,
      requestId,
    },
  });
}
