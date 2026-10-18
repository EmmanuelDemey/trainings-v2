import { describe, expect, it } from 'vitest';
import pkg from '../package.json';

// Typed as plain records: a script or a dependency the starter does not have
// yet must be a red test, not a compile error.
const scripts: Record<string, string> = pkg.scripts;
const devDependencies: Record<string, string> = pkg.devDependencies;

// The raw text of the config files at the project root. Both tools accept
// comments in their JSON config (`.jsonc`), so the specs read text, not JSON.
const oxlintConfigs = import.meta.glob<string>('/.oxlintrc.{json,jsonc}', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const oxfmtConfigs = import.meta.glob<string>('/.oxfmtrc.{json,jsonc}', {
  query: '?raw',
  import: 'default',
  eager: true,
});

describe('the project tooling', () => {
  it.each(['oxlint', 'oxfmt'])('lists %s in the devDependencies', (name) => {
    expect(devDependencies).toHaveProperty(name);
  });

  it('runs TypeScript 7', () => {
    expect(devDependencies.typescript).toMatch(/^[\^~]?7\./);
  });

  it('has a lint script running oxlint', () => {
    expect(scripts.lint).toMatch(/^oxlint\b/);
  });

  it('has a format script writing the files with oxfmt', () => {
    expect(scripts.format).toMatch(/^oxfmt\b/);
    expect(scripts.format).not.toMatch(/--check/);
  });

  it('has a format:check script that only checks the formatting', () => {
    expect(scripts['format:check']).toMatch(/^oxfmt\b.*--check/);
  });

  it('has an oxlint config enabling the react plugin and exhaustive-deps', () => {
    const [config] = Object.values(oxlintConfigs);

    expect(config).toBeDefined();
    expect(config).toMatch(/"plugins"\s*:\s*\[[^\]]*"react"/);
    expect(config).toContain('exhaustive-deps');
  });

  it('has an oxfmt config file', () => {
    expect(Object.keys(oxfmtConfigs)).not.toHaveLength(0);
  });
});
