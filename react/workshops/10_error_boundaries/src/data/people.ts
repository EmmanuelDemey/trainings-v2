import type { Person } from '../model/person';

export const people: Person[] = [
  { id: '1', name: 'Luke Skywalker', height: '172', mass: '77', birthYear: '19BBY', homeworld: { name: 'Tatooine' } },
  { id: '2', name: 'C-3PO', height: '167', mass: '75', birthYear: '112BBY', homeworld: { name: 'Tatooine' } },
  { id: '3', name: 'R2-D2', height: '96', mass: '32', birthYear: '33BBY', homeworld: { name: 'Naboo' } },
  { id: '4', name: 'Darth Vader', height: '202', mass: '136', birthYear: '41.9BBY', homeworld: { name: 'Tatooine' } },
  { id: '5', name: 'Leia Organa', height: '150', mass: '49', birthYear: '19BBY', homeworld: { name: 'Alderaan' } },
  { id: '10', name: 'Obi-Wan Kenobi', height: '182', mass: '77', birthYear: '57BBY', homeworld: { name: 'Stewjon' } },
  // A corrupted record, as real APIs sometimes send: the types say `homeworld`
  // is always there, the data disagrees. PersonCard crashes on it — on purpose.
  { id: '23', name: 'IG-88', height: '200', mass: '140', birthYear: '15BBY', homeworld: null } as unknown as Person,
];
