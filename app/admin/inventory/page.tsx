'use client';

import React from 'react';
import {
  InventoryChart,
  InventoryDataTable,
  InventoryFilters,
  InventoryLogDrawer,
  InventoryStats,
} from '@/shared/components';

import type { InventoryItem, InventoryLog } from '@/@types/inventory';

export default function InventoryPage() {
  const [items, setItems] = React.useState<InventoryItem[]>([]);
  const [search, setSearch] = React.useState('');
  const [logs, setLogs] = React.useState<InventoryLog[]>([]);
  const [logItem, setLogItem] = React.useState<InventoryItem | null>(null);

  async function load() {
    const res = await fetch('/api/inventory');
    const data: { items: InventoryItem[] } = await res.json();
    setItems(data.items);
  }

  async function loadLogs(id: number) {
    const res = await fetch(`/api/inventory/logs?inventoryId=${id}`);
    const data: { logs: InventoryLog[] } = await res.json();
    setLogs(data.logs);
  }

  React.useEffect(() => {
    void load();
  }, []);

  const filtered = items.filter((i) =>
    i.productItemId.toString().includes(search),
  );

  return (
    <div className='p-6 space-y-6'>
      <InventoryStats items={items} />
      <InventoryFilters
        search={search}
        setSearch={setSearch}
      />

      <InventoryDataTable
        items={filtered}
        onEdit={(item) => console.log('edit', item)}
        onDelete={(item) => console.log('delete', item)}
        onViewLog={(item) => {
          setLogItem(item);
          loadLogs(item.id);
        }}
      />

      {logItem && (
        <>
          <InventoryChart logs={logs} />
          <InventoryLogDrawer
            open={!!logItem}
            logs={logs}
            onClose={() => setLogItem(null)}
          />
        </>
      )}
    </div>
  );
}
