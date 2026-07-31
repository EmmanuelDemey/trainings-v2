import express from 'express';
import type { Request, Response } from 'express';
import { usersRouter } from './routes/users.ts';
import { jwtGuard } from './middleware/auth.ts';
import { signToken, type TokenClaims } from './auth/token.ts';

const app = express();
app.use(express.json());

// TODO (Step 3): mount hardening middlewares before the routes
//  - helmet()                      → secure HTTP headers
//  - cors()                        → cross-origin requests
//  - express-rate-limit            → throttle abusive clients
// import helmet from 'helmet';
// import cors from 'cors';
// import { rateLimit } from 'express-rate-limit';

/**
 * Demo login route: hands out a JWT so learners can test the protected API.
 * POST a JSON body such as `{ "sub": "alice", "role": "admin" }`.
 */
app.post('/login', (req: Request, res: Response) => {
  const { sub, role } = req.body as Partial<TokenClaims>;
  if (!sub || !role) {
    res.status(400).json({ error: 'sub and role are required' });
    return;
  }
  res.json({ token: signToken({ sub, role }) });
});

// TODO (Step 2): protect the users router with `jwtGuard`
app.use('/api/users', jwtGuard, usersRouter);

const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
