import { Router } from 'express';
import type { Request, Response } from 'express';
import { roleGuard } from '../middleware/auth.ts';

interface User {
  id: number;
  name: string;
  email: string;
}

// In-memory store — replace with a real persistence layer in "Going further".
const users: User[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
];

export const usersRouter: Router = Router();

/** GET /api/users — list every user. */
usersRouter.get('/', (_req: Request, res: Response) => {
  res.json(users);
});

/** GET /api/users/:id — read a single user. */
usersRouter.get('/:id', (req: Request, res: Response) => {
  // `req.params.id` is a string, always. `Number('12abc')` is NaN, and NaN
  // never equals any id — but `Number('')` is 0, so validate explicitly.
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: 'id must be an integer' });
    return;
  }

  const user = users.find((candidate) => candidate.id === id);
  if (!user) {
    res.status(404).json({ error: `user ${id} not found` });
    return;
  }

  res.json(user);
});

/** POST /api/users — create a user (admin only). */
usersRouter.post('/', roleGuard('admin'), (req: Request, res: Response) => {
  const { name, email } = (req.body ?? {}) as Partial<User>;

  // Hand-rolled validation, on purpose: it is enough for two fields, and it
  // shows exactly what a schema library (zod, valibot) buys you the day the
  // payload grows a nested array. See "Going further".
  const errors: string[] = [];
  if (typeof name !== 'string' || name.trim() === '') errors.push('name is required');
  if (typeof email !== 'string' || !email.includes('@')) errors.push('a valid email is required');

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  const user: User = {
    id: Math.max(0, ...users.map((candidate) => candidate.id)) + 1,
    name: (name as string).trim(),
    email: email as string,
  };
  users.push(user);

  // 201 + Location: the two things that make this a REST creation rather than
  // "a POST that happened to work".
  res.status(201).location(`/api/users/${user.id}`).json(user);
});
