'use client';

import { InventoryLog } from '@/@types/inventory';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '../ui/drawer';

interface Props {
  open: boolean;
  onClose: () => void;
  logs: InventoryLog[];
}

export function InventoryLogDrawer({ open, onClose, logs }: Props) {
  return (
    <Drawer
      open={open}
      onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Inventory Log</DrawerTitle>
        </DrawerHeader>

        <div className='p-4 space-y-4 max-h-[70vh] overflow-y-auto'>
          {logs.map((log) => (
            <div
              key={log.id}
              className='border-b pb-2'>
              <div className='font-medium'>{log.reason}</div>
              <div className='text-sm text-gray-600'>
                {log.oldQuantity} → {log.newQuantity}
              </div>
              <div className='text-xs text-gray-400'>{log.createdAt}</div>
            </div>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
