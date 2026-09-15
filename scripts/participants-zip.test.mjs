// node --test scripts/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { participantsZip } from './participants-zip.mjs';

/** A throwaway training: `files` are paths under its root, `tp/` and `downloads/`. */
async function training(files) {
  const root = await mkdtemp(join(tmpdir(), 'participants-'));
  for (const file of files) {
    await mkdir(dirname(join(root, file)), { recursive: true });
    await writeFile(join(root, file), file);
  }
  return { slug: 'demo', workshopsDir: join(root, 'tp'), downloadsDir: join(root, 'downloads') };
}

/** The files inside the zip, sorted — none when it was not written. */
function entriesOf(zipFile) {
  if (!existsSync(zipFile)) {
    return [];
  }
  const { stdout } = spawnSync('zipinfo', ['-1', zipFile], { encoding: 'utf8' });
  return stdout.split('\n').filter((line) => line && !line.endsWith('/')).sort();
}

test('ships the deck, the handbook and the workshops, but not the solutions', async () => {
  const demo = await training([
    'downloads/demo-slides.pdf',
    'downloads/demo-workshops.pdf',
    'downloads/demo-solutions.zip',
    'tp/README.md',
    'tp/01_intro/README.md',
    'tp/01_intro/app.js',
  ]);

  await participantsZip(demo);

  assert.deepEqual(entriesOf(join(demo.downloadsDir, 'demo-participants.zip')), [
    'demo-participants/demo-slides.pdf',
    'demo-participants/demo-workshops.pdf',
    'demo-participants/tp/01_intro/README.md',
    'demo-participants/tp/01_intro/app.js',
    'demo-participants/tp/README.md',
  ]);
});

test('leaves out an optional module that is turned off', async () => {
  const demo = await training([
    'downloads/demo-slides.pdf',
    'downloads/demo-workshops.pdf',
    'tp/01_intro/README.md',
    'tp/_13_fetch/README.md',
  ]);

  await participantsZip(demo);

  assert.deepEqual(entriesOf(join(demo.downloadsDir, 'demo-participants.zip')), [
    'demo-participants/demo-slides.pdf',
    'demo-participants/demo-workshops.pdf',
    'demo-participants/tp/01_intro/README.md',
  ]);
});

test('leaves out what an install or a build regenerates', async () => {
  const demo = await training([
    'downloads/demo-slides.pdf',
    'downloads/demo-workshops.pdf',
    'tp/04_testing/package.json',
    'tp/04_testing/node_modules/vue/index.js',
    'tp/04_testing/dist/index.html',
    'tp/04_testing/coverage/index.html',
    'tp/04_testing/npm-debug.log',
  ]);

  await participantsZip(demo);

  assert.deepEqual(entriesOf(join(demo.downloadsDir, 'demo-participants.zip')), [
    'demo-participants/demo-slides.pdf',
    'demo-participants/demo-workshops.pdf',
    'demo-participants/tp/04_testing/package.json',
  ]);
});

test('leaves out the local env overrides, which may hold real values', async () => {
  const demo = await training([
    'downloads/demo-slides.pdf',
    'downloads/demo-workshops.pdf',
    'tp/09_production/.env.production',
    'tp/09_production/.env.local',
    'tp/09_production/.env.production.local',
  ]);

  await participantsZip(demo);

  assert.deepEqual(entriesOf(join(demo.downloadsDir, 'demo-participants.zip')), [
    'demo-participants/demo-slides.pdf',
    'demo-participants/demo-workshops.pdf',
    'demo-participants/tp/09_production/.env.production',
  ]);
});

test('still ships the workshops when the deck failed to export', async () => {
  const demo = await training(['downloads/demo-workshops.pdf', 'tp/01_intro/README.md']);

  await participantsZip(demo);

  assert.deepEqual(entriesOf(join(demo.downloadsDir, 'demo-participants.zip')), [
    'demo-participants/demo-workshops.pdf',
    'demo-participants/tp/01_intro/README.md',
  ]);
});
