import { PeopleFilter } from './PeopleFilter';

/** Only lays things out: it used to receive the filter just to pass it on. */
export function Toolbar() {
  return (
    <div className="toolbar">
      <PeopleFilter />
    </div>
  );
}
