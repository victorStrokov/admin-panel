import { Input } from '../ui/input';

interface InventoryFiltersProps {
  search: string;
  setSearch: (value: string) => void;
}

export function InventoryFilters({ search, setSearch }: InventoryFiltersProps) {
  return (
    <div className='flex items-center gap-4 mb-4'>
      <Input
        placeholder='Search by productItemId...'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className='w-64'
      />
    </div>
  );
}
