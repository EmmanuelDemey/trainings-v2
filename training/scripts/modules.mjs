// Turns the optional chapters of a deck on and off.
//
//   pnpm run modules                 # what exists, and what is on
//   pnpm run modules fetch on
//   pnpm run modules storage off
//   pnpm run modules all on
//
// An optional module is a chapter plus its workshop. Turning it on:
//   - flips `hide: true` to `hide: false` in javascript.md, so Slidev renders it
//   - renames tp/_12_fetch to tp/12_fetch, and the same under solutions/
//
// That second half matters: the site (site/scripts/sync-workshops.mjs) and the
// printed handbook (scripts/workshops-pdf.mjs) both only pick up folders whose
// name starts with a digit. An underscore keeps a workshop out of everything.
import { readFile, writeFile, rename } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const trainingRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const DECK = 'javascript.md';
const CHAPTERS = 'chapters/javascript';
const WORKSHOPS = 'chapters/javascript/tp';
const SOLUTIONS = 'solutions/javascript';

const MODULES = [
  { key: 'fetch', chapter: '09_fetch.md', workshop: '12_fetch', label: 'Talking to a server (fetch)' },
  { key: 'modules', chapter: '10_modules.md', workshop: '13_es_modules', label: 'ES Modules' },
  { key: 'storage', chapter: '11_storage.md', workshop: '14_storage', label: 'Local & Session Storage' },
];

const deckPath = join(trainingRoot, DECK);

/** The `hide:` line that follows `src: ./chapters/javascript/<chapter>`. */
function hideLine(deck, chapter) {
  const match = deck.match(
    new RegExp(`(src:\\s*\\./${CHAPTERS}/${chapter}\\s*\\nhide:\\s*)(true|false)`),
  );
  if (!match) throw new Error(`${chapter} is not declared in ${DECK}`);
  return match;
}

const folders = (module) => [
  { dir: join(trainingRoot, WORKSHOPS), name: module.workshop },
  { dir: join(trainingRoot, SOLUTIONS), name: module.workshop },
];

function stateOf(deck, module) {
  const shown = hideLine(deck, module.chapter)[2] === 'false';
  const published = folders(module).map(({ dir, name }) => existsSync(join(dir, name)));
  return { shown, published };
}

async function setState(module, on) {
  let deck = await readFile(deckPath, 'utf8');
  const [, prefix, current] = hideLine(deck, module.chapter);
  const wanted = on ? 'false' : 'true';
  const changes = [];

  if (current !== wanted) {
    deck = deck.replace(prefix + current, prefix + wanted);
    await writeFile(deckPath, deck);
    changes.push(`${DECK}: hide: ${wanted}`);
  }

  for (const { dir, name } of folders(module)) {
    const from = join(dir, on ? `_${name}` : name);
    const to = join(dir, on ? name : `_${name}`);
    if (!existsSync(from)) continue;
    if (existsSync(to)) throw new Error(`${to} already exists — sort it out by hand`);
    await rename(from, to);
    changes.push(`${dir.replace(`${trainingRoot}/`, '')}/${on ? name : `_${name}`}`);
  }

  return changes;
}

function list(deck) {
  console.log(`Optional modules of ${DECK}\n`);
  for (const module of MODULES) {
    const { shown, published } = stateOf(deck, module);
    const state = shown && published.every(Boolean) ? 'ON ' : shown || published.some(Boolean) ? '~~~' : 'off';
    console.log(`  ${state}  ${module.key.padEnd(8)} ${module.label}`);
    if (state === '~~~') {
      console.log(
        `         ⚠ half on: deck ${shown ? 'shows' : 'hides'} it, folders ` +
          `${published.every(Boolean) ? 'published' : published.some(Boolean) ? 'half published' : 'hidden'}` +
          ` — run \`pnpm run modules ${module.key} ${shown ? 'on' : 'off'}\` to line them up`,
      );
    }
  }
  console.log('\n  pnpm run modules <key|all> <on|off>');
}

const [key, wanted] = process.argv.slice(2);

if (!key || key === 'list') {
  list(await readFile(deckPath, 'utf8'));
  process.exit(0);
}

if (wanted !== 'on' && wanted !== 'off') {
  console.error('Usage: pnpm run modules <key|all> <on|off>');
  process.exit(1);
}

const targets = key === 'all' ? MODULES : MODULES.filter((module) => module.key === key);
if (targets.length === 0) {
  console.error(`Unknown module "${key}". Known: ${MODULES.map((m) => m.key).join(', ')}, all`);
  process.exit(1);
}

for (const module of targets) {
  const changes = await setState(module, wanted === 'on');
  console.log(
    changes.length
      ? `${module.key} ${wanted}\n  ${changes.join('\n  ')}`
      : `${module.key} was already ${wanted}`,
  );
}

if (wanted === 'on') {
  console.log(
    '\nIts workshop needs a real http:// origin:\n' +
      `  npx serve ${WORKSHOPS}/${targets[0].workshop}`,
  );
}

list(await readFile(deckPath, 'utf8'));
