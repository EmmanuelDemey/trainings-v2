// slugify-lite — a small npm package from before TypeScript: plain JavaScript,
// no types shipped, nothing on DefinitelyTyped. Do not change this file:
// describe it, in src/types/slugify-lite.d.ts.

/** The version of the library. */
export const VERSION = '1.4.0';

/**
 * The words of a text, accents removed: `words('Hello, Wörld!')` → `['Hello', 'World']`.
 */
export function words(input) {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
}

/**
 * A URL-safe version of a text: `slugify('Hello, Wörld!')` → `'hello-world'`.
 *
 * Options, all optional: `separator` (default `'-'`), `lowercase` (default
 * `true`), `maxLength` (default: no limit — the slug is cut at a word boundary).
 */
export function slugify(input, options = {}) {
  const { separator = '-', lowercase = true, maxLength = Infinity } = options;
  let slug = '';
  for (const word of words(input)) {
    const next = slug === '' ? word : `${slug}${separator}${word}`;
    if (next.length > maxLength) break;
    slug = next;
  }
  return lowercase ? slug.toLowerCase() : slug;
}
