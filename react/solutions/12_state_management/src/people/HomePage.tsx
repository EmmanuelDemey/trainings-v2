import { PeopleTable } from './PeopleTable';
import { Toolbar } from './Toolbar';

export function HomePage() {
  return (
    <section aria-label="Characters">
      <Toolbar />
      <PeopleTable />
    </section>
  );
}
