import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, type TokenClaims } from '../auth/token.ts';

// Expose the decoded JWT payload on the request for downstream handlers.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: TokenClaims;
    }
  }
}

/**
 * Verify the `Authorization: Bearer <token>` header.
 *
 * Note what this middleware does NOT do: it never says *why* it rejected. A
 * "token expired" / "bad signature" distinction is a gift to whoever is probing
 * the API — one `401` for every failure mode.
 */
export function jwtGuard(req: Request, res: Response, next: NextFunction): void {
  const header = req.get('authorization');

  // `Bearer <token>`, case-insensitive scheme, exactly two parts.
  const [scheme, token] = header?.split(' ') ?? [];
  if (!token || scheme?.toLowerCase() !== 'bearer') {
    res.status(401).json({ error: 'missing or malformed Authorization header' });
    return;
  }

  try {
    // `verify` throws on a bad signature, a malformed token AND on expiry —
    // which is why the whole thing sits in one try/catch.
    req.user = jwt.verify(token, JWT_SECRET) as TokenClaims;
    next();
  } catch {
    res.status(401).json({ error: 'invalid token' });
  }
}

/**
 * Build a middleware that requires a given `role` claim on the verified JWT.
 *
 * 401 vs 403 is not cosmetic: 401 means "I do not know who you are", 403 means
 * "I know exactly who you are, and you may not do this". Only the first one is
 * worth retrying with a new token.
 */
export function roleGuard(role: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      // Reachable only if the router forgot to run `jwtGuard` first.
      res.status(401).json({ error: 'authentication required' });
      return;
    }

    if (req.user.role !== role) {
      res.status(403).json({ error: `role "${role}" required` });
      return;
    }

    next();
  };
}
