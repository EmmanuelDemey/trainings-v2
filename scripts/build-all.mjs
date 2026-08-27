// Builds everything that gets deployed, into a single folder: build/
//
//   node scripts/build-all.mjs              # everything
//   node scripts/build-all.mjs --only site  # or --only slides
//   node scripts/build-all.mjs --install    # force a dependency install first
//
// Layout produced:
//
//   build/
//     index.html            the workshops site (Starlight)
//     javascript/           its workshop pages
//     vuejs-advanced/
//     _pagefind/            its search index
//     slides/
//       javascript/         the Slidev deck
//       vuejs-advanced/
//     _redirects            SPA fallback, one rule per deck
//
// The site lives at the root and the decks under /slides/<training>/, so the
// landing page of the domain is the workshops index.

import { spawnSync } from 'node:child_process';
import { cp, mkdir, rm, writeFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TRAININGS } from './trainings.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(repoRoot, 'build');
const siteDir = join(repoRoot, 'site');
const trainingDir = join(repoRoot, 'training');

const args = process.argv.slice(2);
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
const forceInstall = args.includes('--install');
// Netlify (and any CI) starts from a bare checkout: the sub-projects have to be
// installed by us, because the host only installs the root package.json.
const onCI = process.env.CI === 'true' || process.env.NETLIFY === 'true';

const buildSite = only === null || only === 'site';
const buildSlides = only === null || only === 'slides';

function run(command, commandArgs, cwd) {
  console.log(`\n$ ${command} ${commandArgs.join(' ')}   (in ${cwd.replace(repoRoot, '.')})`);
  const result = spawnSync(command, commandArgs, { cwd, stdio: 'inherit', shell: false });
  if (result.status !== 0) {
    console.error(`\n✖ failed: ${command} ${commandArgs.join(' ')}`);
    process.exit(result.status ?? 1);
  }
}

function install(cwd, command, commandArgs) {
  if (!forceInstall && !onCI && existsSync(join(cwd, 'node_modules'))) {
    return;
  }
  run(command, commandArgs, cwd);
}

async function directorySize(dir) {
  let total = 0;
  for (const entry of await readdir(dir, { withFileTypes: true, recursive: true })) {
    if (entry.isFile()) {
      total += (await stat(join(entry.parentPath, entry.name))).size;
    }
  }
  return `${(total / 1024 / 1024).toFixed(1)} MB`;
}

console.log(`Building ${TRAININGS.map((t) => t.label).join(' + ')} into build/`);

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

// --- 1. The workshops site (Starlight) --------------------------------------
// It goes to the root of build/, so that the domain lands on the workshop index.
// `npm run build` runs the README ➜ Starlight sync first (prebuild).
if (buildSite) {
  install(siteDir, 'npm', ['ci']);
  run('npm', ['run', 'build'], siteDir);
  await cp(join(siteDir, 'dist'), outDir, { recursive: true });
}

// --- 2. The decks (Slidev) --------------------------------------------------
// One build per deck. `--base` matters: without it the deck requests its assets
// from the domain root and every chunk 404s once it is served from a sub-path.
if (buildSlides) {
  // training/ is a pnpm project; the CI host only knows about the root, so pnpm
  // is fetched on demand rather than assumed to be installed.
  install(trainingDir, 'npx', ['--yes', 'pnpm@10', 'install', '--frozen-lockfile']);

  for (const training of TRAININGS) {
    if (!existsSync(join(trainingDir, training.deck))) {
      console.warn(`⚠ ${training.deck} not found — deck skipped`);
      continue;
    }
    run(
      'npx',
      [
        '--yes',
        'pnpm@10',
        'exec',
        'slidev',
        'build',
        training.deck,
        '--base',
        `/slides/${training.slug}/`,
        // `--out`, not `--output`: the latter belongs to the export (PDF/PNG)
        // options and is silently ignored here, leaving the deck in training/dist.
        '--out',
        join(outDir, 'slides', training.slug),
      ],
      trainingDir,
    );
  }
}

// --- 3. SPA fallback --------------------------------------------------------
// A Slidev deck is a single-page app with history routing: /slides/x/12 is a
// client-side route, not a file. Without this, a reload on slide 12 is a 404.
// The rules are not forced, so real files (assets, chunks) still win.
const redirects = TRAININGS.map(
  (training) =>
    `/slides/${training.slug}/*  /slides/${training.slug}/index.html  200`,
).join('\n');
await writeFile(join(outDir, '_redirects'), `${redirects}\n`);

console.log('\n─────────────────────────────────────────');
console.log(`build/            ${await directorySize(outDir)}`);
console.log('  /               the workshops site');
const pad = Math.max(...TRAININGS.map((t) => t.slug.length));
for (const training of TRAININGS) {
  console.log(`  /slides/${training.slug}/`.padEnd(pad + 12) + `${training.label} deck`);
}
console.log('─────────────────────────────────────────');
console.log('\nPreview it exactly as Netlify will serve it:');
console.log('  npx serve build          (or: npx netlify dev)');
