// node --test scripts/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { checkWorkshops } from './check-workshops.mjs';

/** A throwaway training folder: `files` maps a path under it to its content. */
async function training(files) {
  const dir = await mkdtemp(join(tmpdir(), 'training-'));
  for (const [file, content] of Object.entries(files)) {
    await mkdir(dirname(join(dir, file)), { recursive: true });
    await writeFile(join(dir, file), content);
  }
  return dir;
}

/** An npm project with no dependency, whose scripts are shell commands (`true` passes, `false` fails). */
function project(path, scripts) {
  const name = path.split('/').pop();
  return {
    [`${path}/package.json`]: JSON.stringify({ name, scripts: { typecheck: 'true', build: 'true', ...scripts } }),
    [`${path}/package-lock.json`]: JSON.stringify({ name, lockfileVersion: 3, requires: true, packages: { '': { name } } }),
  };
}

/** A workshop whose solution passes its specs and whose starter does not. */
const sound = (name) => ({
  ...project(`solutions/${name}`, { test: 'true' }),
  ...project(`workshops/${name}`, { test: 'false' }),
});

const config = (object) => `export default ${JSON.stringify(object)};\n`;

test('a workshop whose solution passes and whose starter fails is sound', async () => {
  const dir = await training(sound('01_intro'));

  assert.deepEqual(await checkWorkshops(dir), [{ name: '01_intro', ok: true, failedStep: null }]);
});

test('a starter that passes its specs means an answer leaked into it', async () => {
  const dir = await training({
    ...project('solutions/01_intro', { test: 'true' }),
    ...project('workshops/01_intro', { test: 'true' }),
  });

  assert.deepEqual(await checkWorkshops(dir), [
    { name: '01_intro', ok: false, failedStep: 'The starter must still be unsolved' },
  ]);
});

test('a broken solution fails at the step that broke', async () => {
  const dir = await training({
    ...project('solutions/01_intro', { test: 'true', typecheck: 'false' }),
    ...project('workshops/01_intro', { test: 'false' }),
  });

  assert.deepEqual(await checkWorkshops(dir), [
    { name: '01_intro', ok: false, failedStep: 'The solution typechecks' },
  ]);
});

test('the starter of a workshop where the learner writes the tests must be green', async () => {
  const dir = await training({
    ...project('solutions/06_testing', { test: 'true' }),
    ...project('workshops/06_testing', { test: 'false' }),
    'workshops.ci.mjs': config({ learnerWritesTests: ['06_testing'] }),
  });

  assert.deepEqual(await checkWorkshops(dir), [
    { name: '06_testing', ok: false, failedStep: 'The starter is green — nothing but todos' },
  ]);
});

test('the solutions build only when the training asks for it', async () => {
  const dir = await training({
    ...project('solutions/01_intro', { test: 'true', build: 'false' }),
    ...project('workshops/01_intro', { test: 'false' }),
    'workshops.ci.mjs': config({ build: true }),
  });

  assert.deepEqual(await checkWorkshops(dir), [{ name: '01_intro', ok: false, failedStep: 'The solution builds' }]);
});

test('the setup runs in the training folder before any workshop', async () => {
  const dir = await training({
    // The solution's specs pass only once the setup wrote their fixture.
    ...project('solutions/01_intro', { test: 'test -f ../../synced' }),
    ...project('workshops/01_intro', { test: 'false' }),
    'workshops.ci.mjs': config({ setup: 'touch synced' }),
  });

  assert.deepEqual(await checkWorkshops(dir), [{ name: '01_intro', ok: true, failedStep: null }]);
});

test('every workshop is reported, a broken one does not hide the others', async () => {
  const dir = await training({
    ...sound('01_intro'),
    ...project('solutions/02_router', { test: 'false' }),
    ...project('workshops/02_router', { test: 'false' }),
    ...sound('03_store'),
  });

  assert.deepEqual(await checkWorkshops(dir, { concurrency: 2 }), [
    { name: '01_intro', ok: true, failedStep: null },
    { name: '02_router', ok: false, failedStep: 'The solution passes its specs' },
    { name: '03_store', ok: true, failedStep: null },
  ]);
});
