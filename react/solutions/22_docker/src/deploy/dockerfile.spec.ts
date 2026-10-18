// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { dockerfileStages, readProjectFile } from './files';

const stages = dockerfileStages(readProjectFile('Dockerfile'));
const build = stages[0] ?? [];
const runtime = stages.at(-1) ?? [];
const args = (stage: typeof build, name: string) => stage.filter((i) => i.name === name).map((i) => i.args);

describe('Dockerfile', () => {
  it('builds in one stage and ships from another', () => {
    expect(stages.length).toBeGreaterThanOrEqual(2);
    const alias = /\bAS\s+(\S+)/i.exec(build[0]?.args ?? '')?.[1];
    expect(alias, 'the first FROM names its stage: `FROM … AS build`').toBeDefined();
    expect(args(runtime, 'COPY').some((copy) => copy.includes(`--from=${alias}`))).toBe(true);
  });

  it('installs the exact dependencies of the lockfile, before copying the sources', () => {
    const steps = build.map((i) => `${i.name} ${i.args}`);
    const copyManifests = steps.findIndex((step) => /^COPY .*package-lock\.json/.test(step));
    const install = steps.findIndex((step) => /^RUN npm ci\b/.test(step));
    const copySources = steps.findIndex((step) => /^COPY \.\s/.test(step));

    // Manifests → install → sources: editing a component reuses the cached
    // `npm ci` layer instead of downloading every dependency again.
    expect(copyManifests).toBeGreaterThanOrEqual(0);
    expect(install).toBeGreaterThan(copyManifests);
    expect(copySources).toBeGreaterThan(install);
  });

  it('ships nginx, not Node.js and the sources', () => {
    expect(runtime[0]?.args).toMatch(/nginx/);
  });

  it('runs as a non-root user', () => {
    const users = args(runtime, 'USER');
    expect(users.length, 'the final stage declares a USER').toBeGreaterThan(0);
    expect(users.at(-1)).not.toMatch(/^(root|0)(:|$)/);
  });

  it('exposes the unprivileged port nginx listens on', () => {
    expect(args(runtime, 'EXPOSE')).toContain('8080');
  });

  it('installs the env.js generator where the nginx image runs it at startup', () => {
    expect(args(runtime, 'COPY').some((copy) => /docker\/40-env-js\.sh\s+\/docker-entrypoint\.d\//.test(copy))).toBe(
      true,
    );
  });
});

describe('.dockerignore', () => {
  const ignored = readProjectFile('.dockerignore')
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^\/|\/$/g, ''));

  it('keeps node_modules, dist and git out of the build context', () => {
    // A host's node_modules holds binaries built for the host — and copying it
    // over the `npm ci` of the image would silently replace them.
    expect(ignored).toEqual(expect.arrayContaining(['node_modules', 'dist', '.git']));
  });
});
