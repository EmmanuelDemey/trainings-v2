import type { User } from '../model/user';

/** The accounts the fake API knows. A real API stores password HASHES. */
export const accounts: (User & { username: string; password: string })[] = [
  { id: 'u1', username: 'luke', password: 'usetheforce', name: 'Luke Skywalker', role: 'user' },
  { id: 'u2', username: 'leia', password: 'rebellion', name: 'Leia Organa', role: 'admin' },
];
