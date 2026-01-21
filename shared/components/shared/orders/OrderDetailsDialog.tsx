import type { Order } from '@prisma/client';
import { OrderDetailsModal } from '@/shared/components';

type OrderDetailsDialogProps = {
  order: Order | null;
  open: boolean;
  onClose: () => void;
};

export function OrderDetailsDialog({
  order,
  open,
  onClose,
}: OrderDetailsDialogProps) {
  return (
    <OrderDetailsModal
      order={order}
      open={open}
      onClose={onClose}
    />
  );
}
