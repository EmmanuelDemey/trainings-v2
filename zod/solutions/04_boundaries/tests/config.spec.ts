import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config';

const DATABASE_URL = 'postgres://gigs:secret@localhost:5432/gigs';

/** The message `loadConfig` throws with, or `''` when it does not throw. */
function failure(env: Record<string, string | undefined>) {
  try {
    loadConfig(env);
    return '';
  } catch (error) {
    return (error as Error).message;
  }
}

describe('loadConfig', () => {
  it('applies the defaults when only the database is set', () => {
    expect(loadConfig({ DATABASE_URL })).toEqual({
      NODE_ENV: 'development',
      PORT: 3000,
      DATABASE_URL,
      FEATURE_NEW_CHECKOUT: false,
    });
  });

  it('turns the strings of the environment into numbers and booleans', () => {
    expect(loadConfig({ DATABASE_URL, PORT: '8080', FEATURE_NEW_CHECKOUT: 'yes' })).toMatchObject({
      PORT: 8080,
      FEATURE_NEW_CHECKOUT: true,
    });
  });

  it('reads "false" as false — not as a non-empty, truthy string', () => {
    expect(loadConfig({ DATABASE_URL, FEATURE_NEW_CHECKOUT: 'false' }).FEATURE_NEW_CHECKOUT).toBe(false);
  });

  it('refuses to start without a database', () => {
    expect(failure({})).toContain('DATABASE_URL');
  });

  it('refuses a database URL that is not postgres', () => {
    expect(failure({ DATABASE_URL: 'mysql://localhost/gigs' })).toContain('DATABASE_URL must be a postgres:// URL');
  });

  it('explains a broken port in words a human can act on', () => {
    expect(failure({ DATABASE_URL, PORT: 'eighty' })).toContain('PORT must be a number');
    expect(failure({ DATABASE_URL, PORT: '99999' })).toContain('PORT must be between 1 and 65535');
  });

  it('lists every problem at once, each with the variable to fix', () => {
    const message = failure({ PORT: '99999', NODE_ENV: 'staging' });

    expect(message).toMatch(/^Invalid environment:/);
    expect(message).toContain('→ at NODE_ENV');
    expect(message).toContain('→ at PORT');
    expect(message).toContain('→ at DATABASE_URL');
  });
});
