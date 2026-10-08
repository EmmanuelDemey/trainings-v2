import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, posix, relative, resolve } from 'node:path';

// Vitest runs from the workshop root, which is what `vite.config.ts` calls the
// project root too.
export const SRC = resolve(process.cwd(), 'src');

/** Every `.ts` / `.vue` file under `dir`, recursively. Absolute paths. */
export function sourceFiles(dir: string = SRC): string[] {
  let found: string[] = [];
  try {
    statSync(dir);
  } catch {
    return found;
  }
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) found = found.concat(sourceFiles(full));
    else if (/\.(ts|vue)$/.test(entry)) found.push(full);
  }
  return found;
}

export function exists(pathFromSrc: string): boolean {
  try {
    statSync(join(SRC, pathFromSrc));
    return true;
  } catch {
    return false;
  }
}

/** The path, relative to `src/`, with forward slashes — `ui/Badge.vue`. */
export function labelOf(file: string): string {
  return relative(SRC, file).split(/[\\/]/).join(posix.sep);
}

const IMPORT = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g;

/**
 * What a file imports, expressed as paths relative to `src/` — so `'../stores/invoices'`
 * and `'@/stores/invoices'` both come back as `stores/invoices`. External
 * packages (`vue`, `pinia`, …) are left out: the dependency rule is about our
 * own layers.
 */
export function localImportsOf(file: string): string[] {
  const source = readFileSync(file, 'utf8');
  const here = dirname(file);
  const imports: string[] = [];

  for (const match of source.matchAll(IMPORT)) {
    const specifier = match[1]!;
    const target = specifier.startsWith('@/')
      ? join(SRC, specifier.slice(2))
      : specifier.startsWith('.')
        ? resolve(here, specifier)
        : null;

    if (target === null) continue;
    imports.push(relative(SRC, target).split(/[\\/]/).join(posix.sep));
  }

  return imports;
}
