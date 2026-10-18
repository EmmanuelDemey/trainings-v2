import type { Person } from '../model/person';

type PeopleTableProps = {
  people: Person[];
};

// Props are chapter 6: for now, read `people` as "the array this component is
// given" — `App` passes it in.
export function PeopleTable({ people }: PeopleTableProps) {
  // TODO 4.1: when `people` is empty, return a <p role="status"> saying
  //           "No character to display." instead of the table.

  // TODO 2.1: return a <table className="people-table"> with the caption
  //           "Characters" and a <thead> holding the five column headers:
  //           Name, Gender, Birth year, Height, Mass.
  // TODO 2.2: in a <tbody>, `map` every person to a <tr> — with a `key`.
  // TODO 3.3: format the height and the mass with `src/utils/format.ts`.
  // TODO 4.2: after the name, a <span className="badge">Droid</span> when the
  //           gender is 'n/a'.
  return null;
}
