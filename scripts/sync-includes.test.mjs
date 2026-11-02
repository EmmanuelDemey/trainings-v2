// node --test scripts/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { syncIncludes } from './sync-includes.mjs';

const files = { '/t/data/setup.md': '```json\nPUT /restaurants\n```\n' };
const read = (path) => {
  if (!(path in files)) throw new Error(`ENOENT: ${path}`);
  return files[path];
};

test('what sits between the markers is replaced by the included file', () => {
  const markdown = ['# TP', '<!-- include: ../data/setup.md -->', 'stale', '<!-- /include -->', 'after'].join('\n');

  assert.equal(
    syncIncludes(markdown, '/t/workshops/README.md', read),
    ['# TP', '<!-- include: ../data/setup.md -->', '```json', 'PUT /restaurants', '```', '<!-- /include -->', 'after'].join('\n'),
  );
});

test('a file already in sync is left as is', () => {
  const markdown = ['<!-- include: ../data/setup.md -->', '```json', 'PUT /restaurants', '```', '<!-- /include -->'].join('\n');

  assert.equal(syncIncludes(markdown, '/t/workshops/README.md', read), markdown);
});

test('every include of a file is synced, each relative to that file', () => {
  const markdown = ['<!-- include: data/setup.md -->', '<!-- /include -->', 'between', '<!-- include: ./data/setup.md -->', 'old', '<!-- /include -->'].join('\n');

  assert.equal(
    syncIncludes(markdown, '/t/README.md', read),
    ['<!-- include: data/setup.md -->', '```json', 'PUT /restaurants', '```', '<!-- /include -->', 'between', '<!-- include: ./data/setup.md -->', '```json', 'PUT /restaurants', '```', '<!-- /include -->'].join('\n'),
  );
});

test('an include without its closing marker is an error', () => {
  const markdown = ['<!-- include: ../data/setup.md -->', 'stale'].join('\n');

  assert.throws(() => syncIncludes(markdown, '/t/workshops/README.md', read), /line 1: no <!-- \/include -->/);
});

test('a file without includes is left as is', () => {
  assert.equal(syncIncludes('# TP\n\ntext\n', '/t/README.md', read), '# TP\n\ntext\n');
});
