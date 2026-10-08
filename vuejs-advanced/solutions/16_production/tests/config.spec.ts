import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * STEP 4 — the executable half of the environment configuration.
 *
 * These specs are given. They are red on the skeleton, and they pin the two bugs
 * step 4 exists to prevent:
 *
 *   npm test
 *   npm run test:watch
 *
 * They are the only specs in this workshop, and that is deliberate. The rest of
 * it — bundle splitting, cache headers, the pipeline — is verified by the command
 * it is about: `npm run build`, `npm run size`, and `npm run verify:serving`
 * against your deployment. A test asserting that `nginx.conf` *contains* a line
 * would prove nothing about how the server actually answers, which is exactly
 * the mistake step 5 is there to cure.
 *
 * `config` reads `import.meta.env` at module load, so each case stubs the
 * environment first, then imports the module fresh — hence `vi.resetModules()`.
 */
describe('the app configuration', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('fails loudly at startup when a required variable is missing', async () => {
    vi.stubEnv('VITE_API_URL', '');

    // The alternative to throwing here is not "no error". It is
    // `fetch('undefined/api/invoices')` at 3am, from a user who cannot tell you
    // which page they were on.
    await expect(import('@/config')).rejects.toThrow(/VITE_API_URL/);
  });

  it('disables the feature when the flag is the string "false"', async () => {
    vi.stubEnv('VITE_FEATURE_REPORTS', 'false');

    const { config } = await import('@/config');

    // `Boolean('false')` is `true` — `'false'` is a non-empty string. This is the
    // single most common feature-flag bug there is, and it ships the feature
    // enabled to everyone you meant to hide it from.
    expect(config.features.reports).toBe(false);
  });

  it('enables the feature when the flag is the string "true"', async () => {
    vi.stubEnv('VITE_FEATURE_REPORTS', 'true');

    const { config } = await import('@/config');

    expect(config.features.reports).toBe(true);
  });
});
