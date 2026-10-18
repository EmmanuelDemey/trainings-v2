import { useTranslation } from 'react-i18next';
import { formatDate, formatHeight, formatMass, formatRelative } from '../format';
import type { Person } from '../model/person';

interface PeopleTableProps {
  people: Person[];
  likes: ReadonlySet<string>;
  onToggleLike: (id: string) => void;
}

export function PeopleTable({ people, likes, onToggleLike }: PeopleTableProps) {
  const { t, i18n } = useTranslation();
  // The language i18next actually uses — the one `Intl` must format for.
  const locale = i18n.resolvedLanguage ?? 'en';
  const now = new Date();

  return (
    <table>
      <thead>
        <tr>
          <th scope="col">{t('table.name')}</th>
          <th scope="col">{t('table.height')}</th>
          <th scope="col">{t('table.mass')}</th>
          <th scope="col">{t('table.updated')}</th>
          <th scope="col">{t('table.favourite')}</th>
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
                {/* Interpolation: the name goes INTO the sentence, wherever
                    the language puts it — never concatenated around it. */}
                <button type="button" aria-pressed={liked} onClick={() => onToggleLike(person.id)}>
                  {t(liked ? 'table.unlike' : 'table.like', { name: person.name })}
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
