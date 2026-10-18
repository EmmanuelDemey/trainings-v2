import type { Translation } from './en';

// Typed as `Translation`: a key missing here, or misspelled, is a compile error.
// TODO 1.2: translate every message to French. Keep the `{{variables}}` as they are.
export const fr = {
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
  // TODO 4.3: French plurals are not English ones — check
  //   `new Intl.PluralRules('fr').select(n)` for 0, 1, 2 and 1000000, and add
  //   the form that English does not have (the README explains).
  likes_one: 'You like {{count}} character.',
  likes_other: 'You like {{count}} characters.',
} satisfies Translation;
