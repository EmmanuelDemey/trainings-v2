import type { Person } from '../model/person';

export const people: Person[] = [
  {
    id: '1',
    name: 'Luke Skywalker',
    birthYear: '19BBY',
    bio: '<p>A farm boy from <strong>Tatooine</strong> who became a Jedi.</p>',
    homepage: 'https://starwars.fandom.com/wiki/Luke_Skywalker',
  },
  {
    id: '4',
    name: 'Darth Vader',
    birthYear: '41.9BBY',
    // Someone edited this bio: the <img> runs a script as soon as it fails to load.
    bio: '<p>Dark Lord of the Sith.</p><img src="x" onerror="window.__pwned = true">',
    homepage: 'javascript:window.__pwned = true',
  },
  {
    id: '5',
    name: 'Leia Organa',
    birthYear: '19BBY',
    bio: '<p>Princess of <em>Alderaan</em>, general of the Resistance.</p>',
    homepage: 'https://starwars.fandom.com/wiki/Leia_Organa',
  },
];
