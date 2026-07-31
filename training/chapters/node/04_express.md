---
layout: cover
---

# 4 - Express framework

---

# Express

- **Minimalist** HTTP framework for Node.js
- The most widely used in the ecosystem
- Built on the concept of chained **middlewares**
- Modern alternatives: **Fastify**, **Koa**, **Hono**, **NestJS**

```bash
npm install express
```

```ts
import express from 'express';
import type { Request, Response } from 'express';

const app = express();

app.get('/health', (req: Request, res: Response) => res.json({ status: 'ok' }));

app.listen(3000, () => console.log('Listening on 3000'));
```

---

# Middlewares

- A function with the `(req, res, next)` signature
- Run in declaration order
- Either end the response or pass control with `next()`

```ts
import type { Request, Response, NextFunction } from 'express';

const timing = new WeakMap<Request, number>();

app.use((req: Request, res: Response, next: NextFunction) => {
  timing.set(req, Date.now());
  res.on('finish', () => {
    const start = timing.get(req) ?? Date.now();
    console.log(`${req.method} ${req.url} - ${Date.now() - start}ms`);
  });
  next();
});
```

---

# Middlewares - error handling

- Error middlewares take **4 parameters**: `(err, req, res, next)`
- Must be declared **after** all routes

```ts
import type { Request, Response, NextFunction } from 'express';

interface HttpError extends Error {
  status?: number;
}

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  logger.error(err);
  res.status(err.status ?? 500).json({ message: err.message });
});
```

- For an async handler, propagate the error via `next(err)` or use `express-async-errors`

---

# Routing

- HTTP methods: `app.get`, `app.post`, `app.put`, `app.patch`, `app.delete`, `app.all`
- Dynamic parameters

```ts
import type { Request, Response } from 'express';

app.get('/users/:id', (req: Request, res: Response) => {
  res.json({ id: req.params.id });
});
```

- Wildcards: `/files/*`
- Validation: use `zod`, `joi` or `express-validator`

---

# Routing - Router

- `express.Router()` lets you modularize routes

```ts
// users.router.ts
import { Router } from 'express';

const router = Router();

router.get('/', listUsers);
router.get('/:id', getUser);
router.post('/', createUser);

export default router;
```

```ts
// app.ts
import usersRouter from './users.router.ts';

app.use('/api/users', usersRouter);
```

---

# Body parsing

- Express ships built-in parsing middlewares

```ts
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
```

- For **multipart uploads**: `multer` or `busboy`

---

# Guards - securing access

- A **guard** is a middleware that checks a condition before allowing access
- Auth patterns:
  - **Session/cookie**: `express-session` + store (Redis, Mongo)
  - **JWT**: `jsonwebtoken`, `passport-jwt`
  - **OAuth2 / OIDC**: `passport`, `openid-client`
  - **API Key**: custom header

---

# Guard - JWT

```ts
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

const authGuard = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET!);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

app.get('/me', authGuard, (req: Request, res: Response) => res.json(req.user));
```

---

# Guard - roles / permissions

- Compose multiple middlewares to enforce a policy

```ts
import type { Request, Response, NextFunction } from 'express';

const requireRole =
  (role: string) => (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.roles?.includes(role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };

app.delete('/users/:id', authGuard, requireRole('admin'), deleteUser);
```

---

# Passport strategies

- **passport** offers a pluggable **strategy** system

```ts
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import type { Request, Response } from 'express';

passport.use(new LocalStrategy(async (username, password, done) => {
  const user = await userRepo.findByUsername(username);
  if (!user || !await user.verifyPassword(password)) {
    return done(null, false);
  }
  done(null, user);
}));

app.post('/login',
  passport.authenticate('local', { session: false }),
  (req: Request, res: Response) => res.json({ token: signToken(req.user) }),
);
```

---

# Security - best practices

- **`helmet`**: hardens HTTP headers (CSP, HSTS, X-Frame-Options...)
- **`cors`**: fine-tune allowed origins
- **`express-rate-limit`**: brute-force / DDoS protection
- **`csurf`** or custom CSRF tokens for forms
- Validate **all** inputs (body, query, params)
- Always **hash** passwords (`bcrypt`, `argon2`)
- Disable `x-powered-by` (`app.disable('x-powered-by')`)

```ts
app.use(helmet());
app.use(cors({ origin: 'https://app.sparks.fr' }));
app.use(rateLimit({ windowMs: 60_000, max: 100 }));
```

---

# Node.js 24 - zero-dependency wins

- **Native `.env`** loading - no more `dotenv`:

```bash
node --env-file=.env app.ts
```

```ts
process.loadEnvFile(); // or process.loadEnvFile('.env.local')
console.log(process.env.JWT_SECRET);
```

- **Global `URLPattern`** for path matching without a dependency:

```ts
const pattern = new URLPattern({ pathname: '/users/:id' });
const match = pattern.exec({ pathname: '/users/42' });
console.log(match?.pathname.groups.id); // '42'
```

---

# Modern alternatives

| Framework | Strengths |
|-----------|-----------|
| **Fastify** | Very fast, native JSON schemas, plugin system |
| **Koa** | Minimalist core, async/await first |
| **Hono** | Multi-runtime (Node, Bun, Deno, Workers) |
| **NestJS** | Opinionated architecture, DI, decorators |

- Express remains the reference for its **stability** and **community**
- For new projects, consider Fastify or NestJS if performance/structure matter most

---
layout: cover
---

# Hands-on

## Workshop 4 - Express
- Build a `/api/users` REST API with modular routing
- Add a JWT guard + an admin role guard
- Configure helmet, cors, rate-limit
