import * as z from 'zod';

/**
 * The environment the server starts with. Every variable is a string or
 * missing: the schema coerces, defaults and checks them ONCE, at start-up, so
 * the rest of the code reads `config.port` (a number) instead of
 * `process.env.PORT` (a `string | undefined`).
 */
export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce
    .number({ error: 'PORT must be a number' })
    .int()
    .min(1)
    .max(65535, 'PORT must be between 1 and 65535')
    .default(3000),
  DATABASE_URL: z.url({
    protocol: /^postgres(ql)?$/,
    error: 'DATABASE_URL must be a postgres:// URL',
  }),
  /** `"true"`, `"1"`, `"yes"`, `"on"`… — and their opposites. */
  FEATURE_NEW_CHECKOUT: z.stringbool().default(false),
});

export type Config = z.output<typeof EnvSchema>;

/**
 * Parses the environment, or stops the start-up with EVERY problem listed,
 * one per line, each with the variable to fix.
 */
export function loadConfig(env: Record<string, string | undefined>): Config {
  const result = EnvSchema.safeParse(env);
  if (!result.success) {
    throw new Error(`Invalid environment:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
