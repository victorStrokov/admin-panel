'use client';

import { Line } from 'react-chartjs-2';

interface Props {
  logs: any[];
}

export function InventoryChart({ logs }: Props) {
  const data = {
    labels: logs.map((l) => new Date(l.createdAt).toLocaleDateString()),
    datasets: [
      {
        label: 'Quantity',
        data: logs.map((l) => l.newQuantity),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.3)',
      },
    ],
  };

  return (
    <div className='p-4 bg-white rounded-lg border shadow-sm'>
      <Line data={data} />
    </div>
  );
}
