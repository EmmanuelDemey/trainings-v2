import { PeopleTable } from './PeopleTable';
import { Toolbar } from './Toolbar';

interface HomePageProps {
  filter: string;
  onFilterChange: (filter: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

// TODO 2.3 / 5.3: HomePage uses none of these props itself.
export function HomePage({ filter, onFilterChange, favorites, onToggleFavorite }: HomePageProps) {
  return (
    <section aria-label="Characters">
      <Toolbar filter={filter} onFilterChange={onFilterChange} />
      <PeopleTable filter={filter} favorites={favorites} onToggleFavorite={onToggleFavorite} />
    </section>
  );
}
