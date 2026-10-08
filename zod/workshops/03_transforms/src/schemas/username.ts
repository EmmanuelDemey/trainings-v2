import * as z from 'zod';

/** Asks the server whether a username is already taken — a network call. */
export type IsTaken = (username: string) => Promise<boolean>;

/**
 * The username of a new account: 3 to 20 lowercase letters, digits or `_`, and
 * not taken yet.
 *
 * TODO 3: add the availability check — 'This username is already taken'. It
 * costs a request: a malformed username (`"ab"`, `"Nina!"`) must NEVER reach the
 * server. Chain it the obvious way first, and watch the spec that counts calls.
 */
export function usernameSchema(isTaken: IsTaken) {
  void isTaken;
  return z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-z0-9_]+$/, 'Lowercase letters, digits and _ only');
}
