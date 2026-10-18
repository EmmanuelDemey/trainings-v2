interface PeopleFilterProps {
  value: string;
  onChange: (value: string) => void;
}

// TODO 2.2: read and set the filter with `useFilter()` instead of props.
export function PeopleFilter({ value, onChange }: PeopleFilterProps) {
  return (
    <p>
      <label htmlFor="people-filter">Filter by name</label>{' '}
      <input id="people-filter" type="search" value={value} onChange={(event) => onChange(event.target.value)} />
    </p>
  );
}
