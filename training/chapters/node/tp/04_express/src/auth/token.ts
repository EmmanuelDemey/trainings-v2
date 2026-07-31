import jwt from 'jsonwebtoken';

/**
 * Demo secret. In a real app, read it from `process.env.JWT_SECRET`
 * (e.g. via `process.loadEnvFile()` + a `.env` file) and never hard-code it.
 */
export const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me';

export interface TokenClaims {
  sub: string;
  role: string;
}

/**
 * Sign a short-lived demo token so learners can test the protected routes.
 *
 * A `/login` route in `server.ts` exposes this helper: POST a JSON body like
 * `{ "sub": "alice", "role": "admin" }` and you get back `{ "token": "..." }`.
 */
export function signToken(claims: TokenClaims): string {
  return jwt.sign(claims, JWT_SECRET, { expiresIn: '1h' });
}
