import * as z from 'zod';

/**
 * The environment the server starts with. Every variable is a string or
 * missing — today the schema only checks that, so the rest of the code still
 * gets strings.
 *
 * TODO 1: make it the ONE place that coerces, defaults and checks:
 *   - `NODE_ENV`: `development`, `test` or `production` — `development` by default
 *   - `PORT`: a whole number between 1 and 65535 — `3000` by default
 *       'PORT must be a number' / 'PORT must be between 1 and 65535'
 *   - `DATABASE_URL`: required, a `postgres://` or `postgresql://` URL
 *       'DATABASE_URL must be a postgres:// URL'
 *   - `FEATURE_NEW_CHECKOUT`: `"true"`, `"yes"`, `"1"`, `"false"`… → a boolean — `false` by default
 */
export const EnvSchema = z.object({
  NODE_ENV: z.string().optional(),
  PORT: z.string().optional(),
  DATABASE_URL: z.string(),
  FEATURE_NEW_CHECKOUT: z.string().optional(),
});

export type Config = z.output<typeof EnvSchema>;

/**
 * TODO 1: parse the environment, or stop the start-up with an `Error` whose
 * message starts with `Invalid environment:` and lists EVERY problem, one per
 * line, each with the variable to fix. Zod has a formatter for exactly that.
 */
export function loadConfig(env: Record<string, string | undefined>): Config {
  return EnvSchema.parse(env);
}
