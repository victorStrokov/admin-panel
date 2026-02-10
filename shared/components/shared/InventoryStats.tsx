import { Card, CardContent, CardHeader, CardTitle } from '../ui';

type InventoryItem = {
  id: number;
  productItemId: number;
  quantity: number;
};

export function InventoryStats({ items }: { items: InventoryItem[] }) {
  const low = items.filter((i) => i.quantity > 0 && i.quantity < 5).length;
  const out = items.filter((i) => i.quantity === 0).length;

  return (
    <div className='grid grid-cols-2 gap-4'>
      <Card>
        <CardHeader>
          <CardTitle>Low stock</CardTitle>
        </CardHeader>
        <CardContent className='text-3xl font-bold'>{low}</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Out of stock</CardTitle>
        </CardHeader>
        <CardContent className='text-3xl font-bold text-red-600'>
          {out}
        </CardContent>
      </Card>
    </div>
  );
}
