// Checks that the two TypeScript trainings teach exactly the same thing:
//
//   node ../typescript-common/scripts/parity.mjs
//
// typescript/ (vanilla) and typescript-react/ share their text through
// typescript-common/slides/, and differ only by their code snippets. For each
// chapter, both decks must have the same slides, in the same order: the same
// titles, and the same common fragments imported at the same places. For each
// workshop, both READMEs must have the same numbered steps (the `### N.` headings) and the
// same row count in "The workshop at a glance".
//
// Exits 1 and lists every difference.

import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(import.meta.url), '../../..');
const TRAININGS = ['typescript', 'typescript-react'];

/** The outline of a chapter: one line per slide, `# title` or `src: …`. */
export function outline(markdown) {
  const lines = markdown.split('\n');
  const items = [];
  let fence = false;
  for (const line of lines) {
    if (line.startsWith('```')) fence = !fence;
    if (fence) continue;
    if (/^src: /.test(line)) items.push(line.replace('src: ', 'src '));
    else if (/^# /.test(line)) items.push(line);
  }
  return items;
}

/** The outline of a workshop README: its step headings, and the size of its table. */
export function steps(markdown) {
  // Only the step numbers: the React steps name React things (a component, a hook).
  const headings = markdown
    .split('\n')
    .filter((line) => /^### /.test(line))
    .map((line) => `step ${line.match(/^### (\d+\.|.*\(Bonus\))/)?.[1] ?? line}`);
  const table = markdown.split('## The workshop at a glance')[1]?.split('\n## ')[0] ?? '';
  const rows = table.split('\n').filter((line) => /^\| \d/.test(line)).length;
  return [...headings, `table rows: ${rows}`];
}

async function chapters(dir) {
  return (await readdir(dir)).filter((name) => /^\d\d_.*\.md$/.test(name)).sort();
}

async function folders(dir) {
  if (!existsSync(dir)) return [];
  return (await readdir(dir, { withFileTypes: true })).filter((e) => e.isDirectory() && /^\d\d_/.test(e.name)).map((e) => e.name).sort();
}

function diff(label, a, b) {
  const errors = [];
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) {
    if (a[i] !== b[i]) errors.push(`${label}, item ${i + 1}:\n    typescript:       ${a[i] ?? '(missing)'}\n    typescript-react: ${b[i] ?? '(missing)'}`);
  }
  return errors;
}

export async function parity() {
  const errors = [];
  const [vanilla, react] = TRAININGS.map((t) => join(root, t));

  const [chA, chB] = [await chapters(join(vanilla, 'slides')), await chapters(join(react, 'slides'))];
  errors.push(...diff('chapters', chA, chB));
  for (const name of chA.filter((n) => chB.includes(n))) {
    const [a, b] = await Promise.all([vanilla, react].map(async (d) => outline(await readFile(join(d, 'slides', name), 'utf8'))));
    errors.push(...diff(`slides/${name}`, a, b));
  }

  for (const kind of ['workshops', 'solutions']) {
    const [wA, wB] = [await folders(join(vanilla, kind)), await folders(join(react, kind))];
    errors.push(...diff(kind, wA, wB));
    for (const name of wA.filter((n) => wB.includes(n))) {
      const readme = (d) => join(d, kind, name, 'README.md');
      const [a, b] = await Promise.all(
        [vanilla, react].map(async (d) => (existsSync(readme(d)) ? steps(await readFile(readme(d), 'utf8')) : ['(no README.md)'])),
      );
      errors.push(...diff(`${kind}/${name}/README.md`, a, b));
    }
  }
  return errors;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const errors = await parity();
  if (errors.length) {
    console.error(`✘ the two TypeScript trainings differ (${errors.length}):\n\n${errors.join('\n')}`);
    process.exit(1);
  }
  console.log('✔ typescript and typescript-react have the same slides and the same workshop steps');
}
