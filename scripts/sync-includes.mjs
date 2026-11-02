// Keeps the blocks a training repeats from one file to the other — the setup of a
// dataset several workshops load, say — in one place. In a README, a chapter or a
// fixture, an include marks where the shared file goes:
//
//   <!-- include: ../../data/restaurants.md -->
//   …the content of data/restaurants.md, written there by this script…
//   <!-- /include -->
//
// The path is relative to the file holding the marker. The copy stays in the file,
// so the site, the PDFs, the ZIPs and scripts/check-console.mjs read it as is; this
// script only rewrites it from its source:
//
//   node scripts/sync-includes.mjs <training dir>           rewrite the copies
//   node scripts/sync-includes.mjs <training dir> --check   exit 1 when one is stale (CI)

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const OPEN = /^<!--\s*include:\s*(\S+)\s*-->$/;
const CLOSE = /^<!--\s*\/include\s*-->$/;

/** `markdown`, the file at `file`, with each include replaced by what `read(path)` returns. */
export function syncIncludes(markdown, file, read) {
  const lines = markdown.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    out.push(lines[i]);
    const open = lines[i].trim().match(OPEN);
    if (!open) continue;
    const end = lines.findIndex((line, j) => j > i && CLOSE.test(line.trim()));
    if (end < 0) throw new Error(`${file}: line ${i + 1}: no <!-- /include --> after the include of ${open[1]}`);
    out.push(read(resolve(dirname(file), open[1])).replace(/\n$/, ''), lines[end]);
    i = end;
  }
  return out.join('\n');
}

/** The Markdown files of a training that may hold an include. */
function markdownFiles(dir) {
  const walk = (folder) =>
    !existsSync(folder)
      ? []
      : readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
          if (entry.name === 'node_modules' || entry.name.startsWith('.')) return [];
          const path = join(folder, entry.name);
          return entry.isDirectory() ? walk(path) : entry.name.endsWith('.md') ? [path] : [];
        });
  return ['workshops', 'solutions', 'slides', 'ci'].flatMap((folder) => walk(join(dir, folder)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = resolve(process.argv[2]);
  const check = process.argv.includes('--check');
  const read = (path) => readFileSync(path, 'utf8');
  let stale = 0;
  for (const file of markdownFiles(dir)) {
    const markdown = read(file);
    const synced = syncIncludes(markdown, file, read);
    if (synced === markdown) continue;
    stale++;
    const name = relative(process.cwd(), file);
    if (check) {
      console.log(`✗ ${name}: an include is not in sync with its source`);
      if (process.env.GITHUB_ACTIONS) console.log(`::error file=${name}::An include is not in sync — run node scripts/sync-includes.mjs ${process.argv[2]}`);
    } else {
      writeFileSync(file, synced);
      console.log(`✓ ${name}`);
    }
  }
  if (check && stale) process.exit(1);
}
