export interface User {
  id: string;
  name: string;
  role: 'admin' | 'member';
  age: number;
}

export const ada: User = { id: 'u1', name: 'Ada', role: 'admin', age: 36 };
export const alan: User = { id: 'u2', name: 'Alan', role: 'member', age: 41 };
export const grace: User = { id: 'u3', name: 'Grace', role: 'member', age: 85 };
export const users = [ada, alan, grace];
