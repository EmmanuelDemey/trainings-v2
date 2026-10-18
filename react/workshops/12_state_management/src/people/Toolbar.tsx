import { PeopleFilter } from './PeopleFilter';

interface ToolbarProps {
  filter: string;
  onFilterChange: (filter: string) => void;
}

// TODO 2.3: Toolbar only lays things out — it receives the filter just to pass it on.
export function Toolbar({ filter, onFilterChange }: ToolbarProps) {
  return (
    <div className="toolbar">
      <PeopleFilter value={filter} onChange={onFilterChange} />
    </div>
  );
}
