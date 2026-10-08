// node --test scripts/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { workshopChecks } from './workshops-ci.mjs';

/** A throwaway training folder: `files` maps a path under it to its content. */
async function training(files) {
  const dir = await mkdtemp(join(tmpdir(), 'training-'));
  for (const [file, content] of Object.entries(files)) {
    await mkdir(dirname(join(dir, file)), { recursive: true });
    await writeFile(join(dir, file), content);
  }
  return dir;
}

const config = (object) => `export default ${JSON.stringify(object)};\n`;

test('every solution that is an npm project is a workshop whose starter must fail', async () => {
  const dir = await training({
    'solutions/01_intro/package.json': '{}',
    'solutions/02_router/package.json': '{}',
    'solutions/README.md': '',
  });

  assert.deepEqual(await workshopChecks(dir), {
    workshops: [
      { name: '01_intro', starter: 'red' },
      { name: '02_router', starter: 'red' },
    ],
    setup: '',
    build: false,
    quietTest: '--reporter=default',
    verifyScript: false,
  });
});

test('a workshop where the learner writes the tests has a green starter', async () => {
  const dir = await training({
    'solutions/01_queries/package.json': '{}',
    'solutions/06_testing/package.json': '{}',
    'workshops.ci.mjs': config({ learnerWritesTests: ['06_testing'] }),
  });

  assert.deepEqual((await workshopChecks(dir)).workshops, [
    { name: '01_queries', starter: 'red' },
    { name: '06_testing', starter: 'green' },
  ]);
});

test('a skipped workshop is not checked', async () => {
  const dir = await training({
    'solutions/01_intro/package.json': '{}',
    'solutions/03_testing/package.json': '{}',
    'workshops.ci.mjs': config({ skip: ['03_testing'] }),
  });

  assert.deepEqual((await workshopChecks(dir)).workshops, [{ name: '01_intro', starter: 'red' }]);
});

test('the training-wide settings come from the config', async () => {
  const dir = await training({
    'solutions/01_queries/package.json': '{}',
    'workshops.ci.mjs': config({ setup: 'npm run sync', build: true, quietTest: '--reporters=default' }),
  });

  const { setup, build, quietTest } = await workshopChecks(dir);
  assert.deepEqual({ setup, build, quietTest }, { setup: 'npm run sync', build: true, quietTest: '--reporters=default' });
});

test('a training checked by its own verify script has no npm workshops', async () => {
  const dir = await training({
    'solutions/01_introduction/index.html': '',
    'workshops.ci.mjs': config({ verifyScript: true }),
  });

  const { workshops, verifyScript } = await workshopChecks(dir);
  assert.deepEqual({ workshops, verifyScript }, { workshops: [], verifyScript: true });
});
