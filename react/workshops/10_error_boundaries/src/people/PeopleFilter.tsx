interface PeopleFilterProps {
  value: string;
  onChange: (value: string) => void;
}

/** A controlled text input. It has a planted bug: see `assertSafe`. */
export function PeopleFilter({ value, onChange }: PeopleFilterProps) {
  assertSafe(value);

  return (
    <p>
      <label htmlFor="people-filter">Filter by name</label>{' '}
      <input
        id="people-filter"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </p>
  );
}

/** The bug of this workshop, kept on purpose: a render that throws on one input. */
function assertSafe(value: string) {
  if (value.trim().toLowerCase() === 'order 66') {
    throw new Error('Order 66 executed: the filter is gone');
  }
}
