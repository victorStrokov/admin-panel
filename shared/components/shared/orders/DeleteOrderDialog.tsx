import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components';

type DeleteOrderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number | null;
  onConfirm: (id: number) => void;
};

export function DeleteOrderDialog({
  open,
  onOpenChange,
  orderId,
  onConfirm,
}: DeleteOrderDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить заказ?</AlertDialogTitle>
          <AlertDialogDescription>
            Это действие нельзя отменить. Заказ будет удалён навсегда.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction
            className='bg-red-600 hover:bg-red-700'
            onClick={() => orderId && onConfirm(orderId)}>
            Удалить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
