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

/**
 * GET /api/users — list every user.
 * TODO: respond with the `users` array.
 */
usersRouter.get('/', (_req: Request, res: Response) => {
  // TODO: return the list of users
  res.status(501).json({ error: 'not implemented' });
});

/**
 * GET /api/users/:id — read a single user.
 * TODO: find the user by id, respond `404` when not found.
 */
usersRouter.get('/:id', (req: Request, res: Response) => {
  // TODO: parse `req.params.id`, look it up in `users`
  res.status(501).json({ error: 'not implemented' });
});

/**
 * POST /api/users — create a user (admin only).
 * TODO: validate `req.body` (name + email), assign a new id,
 * push to `users`, respond `201` with the created user.
 */
usersRouter.post('/', roleGuard('admin'), (req: Request, res: Response) => {
  // TODO: validate the body and create the user
  res.status(501).json({ error: 'not implemented' });
});
