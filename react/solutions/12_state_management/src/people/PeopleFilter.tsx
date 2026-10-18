import { useFilter } from '../context/FilterContext';

export function PeopleFilter() {
  const { filter, setFilter } = useFilter();

  return (
    <p>
      <label htmlFor="people-filter">Filter by name</label>{' '}
      <input id="people-filter" type="search" value={filter} onChange={(event) => setFilter(event.target.value)} />
    </p>
  );
}
