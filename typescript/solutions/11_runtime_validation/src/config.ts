// The configuration of the app, read from environment variables: strings, or nothing.
import { z } from 'zod';

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

export const ConfigSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  API_URL: z.url({ protocol: /^https$/ }),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  CACHE: z.stringbool().default(false),
});

export type Config = z.infer<typeof ConfigSchema>;

/** Throws a ConfigError naming every variable that is wrong — not just the first one. */
export function loadConfig(env: Record<string, string | undefined>): Config {
  const result = ConfigSchema.safeParse(env);
  if (!result.success) throw new ConfigError(`Invalid configuration\n${z.prettifyError(result.error)}`);
  return result.data;
}
