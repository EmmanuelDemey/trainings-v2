import * as z from 'zod';

/** Asks the server whether a username is already taken — a network call. */
export type IsTaken = (username: string) => Promise<boolean>;

/**
 * The username of a new account: 3 to 20 lowercase letters, digits or `_`, and
 * not taken yet.
 *
 * The availability check is async: the schema must be parsed with
 * `parseAsync` / `safeParseAsync`. And it costs a request: the format is checked
 * FIRST, in a pipe, so that `"a"` or `"Nina!"` never reach the server. Chained
 * on the same schema instead, the refinement would run even when `.min()` has
 * already failed.
 */
export function usernameSchema(isTaken: IsTaken) {
  return z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-z0-9_]+$/, 'Lowercase letters, digits and _ only')
    .pipe(
      z.string().refine(async (username) => !(await isTaken(username)), {
        message: 'This username is already taken',
      }),
    );
}
