import { people } from './data/people';
import { countMales, getMassAverage, getNames, groupByGender, sortByHeight } from './utils/es';

export function App() {
  const average = getMassAverage(people);
  const groups = groupByGender(people);

  return (
    <main>
      <h1>Star Wars people</h1>
      <ul>
        <li>People: {getNames(people).join(', ')}</li>
        <li>Males: {countMales(people)}</li>
        <li>Average mass: {average === null ? 'unknown' : `${average} kg`}</li>
        <li>Tallest: {sortByHeight(people).at(0)?.name ?? 'nobody'}</li>
        <li>Genders: {Object.keys(groups).join(', ')}</li>
      </ul>
    </main>
  );
}
