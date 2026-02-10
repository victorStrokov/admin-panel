export interface InventoryLog {
  id: number;
  inventoryId: number;
  productItemId: number;
  tenantId: number;
  userId?: number;
  oldQuantity: number;
  newQuantity: number;
  change: number;
  reason: string;
  requestId?: string;
  createdAt: string;
}

export interface InventoryItem {
  id: number;
  productItemId: number;
  quantity: number;
}
