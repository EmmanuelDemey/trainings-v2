// The configuration of the app, read from environment variables: strings, or nothing.
import { z } from 'zod';

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

/** TODO 4: PORT, API_URL, LOG_LEVEL and CACHE — read tests/config.spec.ts. */
export const ConfigSchema = z.object({});

/** TODO 4: inferred from ConfigSchema. */
export type Config = Record<string, unknown>;

/** TODO 4: throws a ConfigError naming every variable that is wrong — not just the first one. */
export function loadConfig(env: Record<string, string | undefined>): Config {
  throw new ConfigError('TODO 4');
}
