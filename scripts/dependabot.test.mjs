// node --test scripts/
//
// .github/dependabot.yml has one npm block per training, so that each Dependabot
// pull request touches a single training, and its auto-merge waits for the CI of
// that training only (.github/workflows/dependabot-auto-merge.yml). A new
// training needs its own block: this test fails until it has one.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(import.meta.url), '../..');

/** Each npm block of dependabot.yml: its `directories`, and the name of its first group. */
async function npmBlocks() {
  const config = await readFile(join(root, '.github/dependabot.yml'), 'utf8');
  return config
    .split(/^ {2}- package-ecosystem:/m)
    .slice(1)
    .filter((block) => block.trimStart().startsWith('npm'))
    .map((block) => ({
      directories: [...block.matchAll(/^ {6}- (\/\S*)$/gm)].map((m) => m[1]),
      group: block.match(/^ {4}groups:\n {6}([\w-]+):/m)?.[1],
    }));
}

async function trainings() {
  const entries = await readdir(root, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && existsSync(join(root, entry.name, 'training.config.mjs')))
    .map((entry) => entry.name)
    .sort();
}

/** The folders of a training holding npm projects: its own, then its workshops and solutions. */
async function expectedDirectories(training) {
  const directories = [`/${training}`];
  for (const sub of ['workshops', 'solutions']) {
    const dir = join(root, training, sub);
    if (!existsSync(dir)) continue;
    const projects = await readdir(dir, { withFileTypes: true });
    if (projects.some((p) => p.isDirectory() && existsSync(join(dir, p.name, 'package.json')))) {
      directories.push(`/${training}/${sub}/*`);
    }
  }
  return directories;
}

test('every training has its own npm block, grouped into one pull request', async () => {
  const blocks = await npmBlocks();
  for (const training of await trainings()) {
    const block = blocks.find((b) => b.directories.includes(`/${training}`));
    assert.ok(block, `${training} has no npm block in .github/dependabot.yml`);
    assert.deepEqual(block.directories, await expectedDirectories(training), `directories of ${training}`);
    assert.equal(block.group, training, `the updates of ${training} must be grouped under its name`);
  }
});

test('no npm block spans two trainings', async () => {
  const names = await trainings();
  for (const { directories } of await npmBlocks()) {
    const owners = new Set(directories.map((dir) => dir.split('/')[1]).filter((dir) => names.includes(dir)));
    assert.ok(owners.size <= 1, `one block covers ${[...owners].join(', ')}`);
  }
});
