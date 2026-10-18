import { people } from '../data/people';

// Pretend this page is heavy — a charting library, big tables… It is only
// needed when the user opens it, which makes it the textbook lazy-loading case.

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

// A default export: `React.lazy` expects a module whose `default` is a component.
export default function StatsPage() {
  const heights = people.map(({ height }) => height);
  const tallest = people.toSorted((a, b) => b.height - a.height)[0];
  const maxHeight = Math.max(...heights);

  return (
    <section aria-labelledby="stats-title">
      <h2 id="stats-title">Statistics</h2>
      <dl>
        <dt>People</dt>
        <dd>{people.length}</dd>
        <dt>Average height</dt>
        <dd>{Math.round(average(heights))} cm</dd>
        <dt>Tallest</dt>
        <dd>{tallest?.name}</dd>
      </dl>
      <svg role="img" aria-label="Heights" width="100%" height={people.length * 28}>
        {people.map((person, index) => (
          <g key={person.id} transform={`translate(0, ${index * 28})`}>
            <rect width={`${(person.height / maxHeight) * 70}%`} height="20" fill="#3e7cb1" />
            <text x="72%" y="15">
              {person.name}
            </text>
          </g>
        ))}
      </svg>
    </section>
  );
}
