// The reference catalogue. `as const` keeps every message as a literal type:
// i18next's types read the keys from it — and the `{{variables}}` too.
export const en = {
  title: 'Star Wars people',
  intro: 'Every character of the original trilogy, at a glance.',
  language: 'Language',
  table: {
    name: 'Name',
    height: 'Height',
    mass: 'Mass',
    updated: 'Last updated',
    favourite: 'Favourite',
    like: 'Like {{name}}',
    unlike: 'Unlike {{name}}',
  },
  // Plurals: i18next adds the suffix that `Intl.PluralRules` picks for `count`
  // — `one` or `other` in English.
  likes_one: 'You like {{count}} character.',
  likes_other: 'You like {{count}} characters.',
} as const;

/** Widens every message to `string`: the shape another language must have. */
type Catalogue<T> = { -readonly [K in keyof T]: T[K] extends string ? string : Catalogue<T[K]> };

export type Translation = Catalogue<typeof en>;
