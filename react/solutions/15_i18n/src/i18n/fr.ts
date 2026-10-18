import type { Translation } from './en';

// Typed as `Translation`: a key missing here, or misspelled, is a compile error.
export const fr = {
  title: 'Personnages de Star Wars',
  intro: 'Tous les personnages de la trilogie originale, en un coup d’œil.',
  language: 'Langue',
  table: {
    name: 'Nom',
    height: 'Taille',
    mass: 'Masse',
    updated: 'Dernière mise à jour',
    favourite: 'Favori',
    like: 'Aimer {{name}}',
    unlike: 'Ne plus aimer {{name}}',
  },
  // In French, 0 is `one` ("0 personnage"), and the millions are `many`
  // ("1 000 000 de personnages"). Without `_many`, i18next finds no message
  // for a million and shows the key.
  likes_one: 'Vous aimez {{count}} personnage.',
  likes_many: 'Vous aimez {{count}} de personnages.',
  likes_other: 'Vous aimez {{count}} personnages.',
} satisfies Translation & { likes_many: string };
