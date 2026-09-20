export interface User {
  id: string;
  name: string;
  email: string;
  team: 'platform' | 'billing' | 'support';
}

const USERS: User[] = [
  { id: '1', name: 'Ada Lovelace', email: 'ada@acme.dev', team: 'platform' },
  { id: '2', name: 'Grace Hopper', email: 'grace@acme.dev', team: 'billing' },
  { id: '3', name: 'Alan Turing', email: 'alan@acme.dev', team: 'support' },
  { id: '4', name: 'Barbara Liskov', email: 'barbara@acme.dev', team: 'platform' },
];

export function listUsers(): User[] {
  return [...USERS];
}

export function findUser(id: string): User | undefined {
  return USERS.find((user) => user.id === id);
}
