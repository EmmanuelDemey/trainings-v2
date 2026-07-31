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
 * TODO:
 *  - read the `Authorization` header and extract the bearer token;
 *  - respond `401` when it is missing or malformed;
 *  - verify the token with `jwt.verify(token, JWT_SECRET)`;
 *  - on success, attach the decoded claims to `req.user` and call `next()`;
 *  - on failure, respond `401`.
 */
export function jwtGuard(req: Request, res: Response, next: NextFunction): void {
  // TODO: implement the JWT verification
  void jwt;
  void JWT_SECRET;
  res.status(501).json({ error: 'jwtGuard not implemented' });
}

/**
 * Build a middleware that requires a given `role` claim on the verified JWT.
 *
 * TODO:
 *  - read `req.user` (populated by `jwtGuard`, which must run first);
 *  - respond `403` when the role does not match;
 *  - otherwise call `next()`.
 */
export function roleGuard(role: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // TODO: implement the role check against `req.user?.role`
    void role;
    res.status(501).json({ error: 'roleGuard not implemented' });
  };
}
