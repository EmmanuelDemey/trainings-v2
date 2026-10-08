// The training-kit projects to deploy, one Netlify site each — read by
// .github/workflows/deploy-trainings.yml.
//
//   node scripts/trainings-to-deploy.mjs              # every training
//   node scripts/trainings-to-deploy.mjs <base> <head> # those changed between two commits
//
// Prints a JSON array of { dir, slug }. A training is any top-level folder holding
// a training.config.mjs: there is no list to maintain, a new training is picked
// up as soon as it is pushed. It counts as changed when a file changed in its own
// folder, or in a sibling folder its package.json scripts reach with `../<dir>`
// (tanstack-query-common for the TanStack Query trainings).

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

async function watchedDirs(root, dir) {
  const { scripts = {} } = JSON.parse(await readFile(join(root, dir, 'package.json'), 'utf8'));
  const siblings = [...Object.values(scripts).join(' ').matchAll(/\.\.\/([^/\s'"]+)/g)].map((m) => m[1]);
  return [dir, ...siblings];
}

/** Every training under `root`, or only those touched by `changedFiles` when given. */
export async function trainingsToDeploy(root, changedFiles) {
  const trainings = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const configFile = join(root, entry.name, 'training.config.mjs');
    if (!entry.isDirectory() || !existsSync(configFile)) continue;

    if (changedFiles) {
      const watched = await watchedDirs(root, entry.name);
      if (!changedFiles.some((file) => watched.some((dir) => file.startsWith(`${dir}/`)))) continue;
    }

    const slug = (await readFile(configFile, 'utf8')).match(/slug:\s*['"]([^'"]+)['"]/)[1];
    trainings.push({ dir: entry.name, slug });
  }
  return trainings.sort((a, b) => a.dir.localeCompare(b.dir));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = resolve(fileURLToPath(import.meta.url), '../..');
  const [base, head] = process.argv.slice(2);
  const changedFiles = base
    ? execFileSync('git', ['diff', '--name-only', base, head ?? 'HEAD'], { cwd: root, encoding: 'utf8' })
        .split('\n')
        .filter(Boolean)
    : undefined;
  console.log(JSON.stringify(await trainingsToDeploy(root, changedFiles)));
}
