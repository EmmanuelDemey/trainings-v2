// node --test scripts/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { trainingsToDeploy } from './trainings-to-deploy.mjs';

/** A throwaway repository: `files` maps a path under its root to its content. */
async function repo(files) {
  const root = await mkdtemp(join(tmpdir(), 'trainings-'));
  for (const [file, content] of Object.entries(files)) {
    await mkdir(dirname(join(root, file)), { recursive: true });
    await writeFile(join(root, file), content);
  }
  return root;
}

const config = (slug) => `export default defineConfig({\n  title: 'Demo',\n  slug: '${slug}',\n});\n`;
const packageJson = (build) => JSON.stringify({ scripts: { build } });

test('without a list of changed files, every training is deployed', async () => {
  const root = await repo({
    'javascript/training.config.mjs': config('javascript'),
    'javascript/package.json': packageJson('training-kit build'),
    'vue/training.config.mjs': config('vuejs-advanced'),
    'vue/package.json': packageJson('training-kit build'),
    'site/package.json': packageJson('astro build'),
  });

  assert.deepEqual(await trainingsToDeploy(root), [
    { dir: 'javascript', slug: 'javascript' },
    { dir: 'vue', slug: 'vuejs-advanced' },
  ]);
});

test('only the trainings whose folder changed are deployed', async () => {
  const root = await repo({
    'javascript/training.config.mjs': config('javascript'),
    'javascript/package.json': packageJson('training-kit build'),
    'vue/training.config.mjs': config('vuejs-advanced'),
    'vue/package.json': packageJson('training-kit build'),
  });

  assert.deepEqual(await trainingsToDeploy(root, ['vue/slides/01_intro.md', 'README.md', 'vue-other/x.md']), [
    { dir: 'vue', slug: 'vuejs-advanced' },
  ]);
});

test('a change in a sibling folder a training builds from deploys that training', async () => {
  const root = await repo({
    'react/training.config.mjs': config('tanstack-query-react'),
    'react/package.json': packageJson('node ../common/scripts/sync.mjs && training-kit build'),
    'javascript/training.config.mjs': config('javascript'),
    'javascript/package.json': packageJson('training-kit build'),
    'common/scripts/sync.mjs': '',
  });

  assert.deepEqual(await trainingsToDeploy(root, ['common/slides/concepts.md']), [
    { dir: 'react', slug: 'tanstack-query-react' },
  ]);
});
