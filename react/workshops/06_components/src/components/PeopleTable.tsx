import type { Person } from '../model/person';

type PeopleTableProps = {
  people: Person[];
};

export function PeopleTable({ people }: PeopleTableProps) {
  // TODO 5.1: move the <table> out of `App` into here, rendering `people`.
  // TODO 5.2: when `people` is empty, a <p role="status">No character matches.</p>
  //           instead of the table.
  return null;
}
