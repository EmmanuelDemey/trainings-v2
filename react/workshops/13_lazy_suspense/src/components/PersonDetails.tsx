interface PersonDetailsProps {
  id: string;
}

export function PersonDetails({ id }: PersonDetailsProps) {
  // TODO 3.1: read the person with `use(getPerson(id))` (`use` from 'react',
  //   `getPerson` from '../api/people') and render:
  //   <article aria-labelledby="person-name">
  //     <h2 id="person-name">{name}</h2>
  //     <dl> Height "172 cm", Mass "77 kg", Birth year, Eye colour </dl>
  //   </article>
  return <p>Person {id} — TODO</p>;
}
