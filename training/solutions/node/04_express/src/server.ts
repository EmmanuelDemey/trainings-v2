import express from 'express';
import type { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { usersRouter } from './routes/users.ts';
import { jwtGuard } from './middleware/auth.ts';
import { signToken, type TokenClaims } from './auth/token.ts';

const app = express();

// Step 3 — hardening. Order matters: these run BEFORE any route, so a blocked
// request never reaches the application code at all.

// Secure headers (CSP, X-Content-Type-Options, Referrer-Policy…). One line here
// replaces a dozen `res.setHeader` calls you would forget to keep in sync.
app.use(helmet());

// CORS. `cors()` with no argument answers `Access-Control-Allow-Origin: *`,
// which is fine for a public read-only API and wrong for anything with
// credentials — name the origins you actually serve.
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:5173'],
    methods: ['GET', 'POST'],
  }),
);

// Rate limiting. The point is not to stop a determined attacker (that belongs in
// front of the app) but to keep one buggy client from starving everybody else.
app.use(
  rateLimit({
    windowMs: 60_000,
    limit: 100, // per IP, per window
    standardHeaders: 'draft-8', // RateLimit-* headers, RFC-style
    legacyHeaders: false, // drop the old X-RateLimit-* pair
  }),
);

app.use(express.json());

/**
 * Demo login route: hands out a JWT so learners can test the protected API.
 * POST a JSON body such as `{ "sub": "alice", "role": "admin" }`.
 *
 * A stricter limiter on the credential endpoint than on the rest of the API:
 * this is the one route worth brute-forcing.
 */
app.post(
  '/login',
  rateLimit({ windowMs: 60_000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false }),
  (req: Request, res: Response) => {
    const { sub, role } = req.body as Partial<TokenClaims>;
    if (!sub || !role) {
      res.status(400).json({ error: 'sub and role are required' });
      return;
    }
    res.json({ token: signToken({ sub, role }) });
  },
);

// Step 2 — every /api/users route requires a valid JWT; `roleGuard('admin')`
// then narrows the POST inside the router itself.
app.use('/api/users', jwtGuard, usersRouter);

const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
