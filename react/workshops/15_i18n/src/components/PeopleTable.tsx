import { formatDate, formatHeight, formatMass, formatRelative } from '../format';
import type { Person } from '../model/person';

interface PeopleTableProps {
  people: Person[];
  likes: ReadonlySet<string>;
  onToggleLike: (id: string) => void;
}

export function PeopleTable({ people, likes, onToggleLike }: PeopleTableProps) {
  // TODO 2.2: `const { t, i18n } = useTranslation()`, and translate the headers
  //   with the `table.*` keys.
  // TODO 5.2: format for the language in use: `i18n.resolvedLanguage ?? 'en'`.
  const locale = 'en';
  const now = new Date();

  return (
    <table>
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Height</th>
          <th scope="col">Mass</th>
          <th scope="col">Last updated</th>
          <th scope="col">Favourite</th>
        </tr>
      </thead>
      <tbody>
        {people.map((person) => {
          const liked = likes.has(person.id);
          return (
            <tr key={person.id}>
              <th scope="row">{person.name}</th>
              <td>{formatHeight(person.height, locale)}</td>
              <td>{formatMass(person.mass, locale)}</td>
              <td>
                <time dateTime={person.edited} title={formatDate(person.edited, locale)}>
                  {formatRelative(person.edited, now, locale)}
                </time>
              </td>
              <td>
                <button type="button" aria-pressed={liked} onClick={() => onToggleLike(person.id)}>
                  {/* TODO 4.1: never concatenate a translated sentence: use
                      `t('table.like', { name })` / `t('table.unlike', { name })`. */}
                  {(liked ? 'Unlike ' : 'Like ') + person.name}
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
