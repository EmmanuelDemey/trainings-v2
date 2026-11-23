// node --test scripts/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkBudget } from './budget.mjs';

const page = { dom: 300, requests: 12, sizeKb: 450, score: 78.4, grade: 'B' };

test('a page within every limit passes, with one line per limit', () => {
  const result = checkBudget(page, { maxDom: 400, maxRequests: 15, maxSizeKb: 500, minGrade: 'B' });
  assert.equal(result.ok, true);
  assert.equal(result.lines.length, 4);
  assert.ok(result.lines.every((line) => line.ok));
});

test('a limit the page goes over fails, and says by how much', () => {
  const result = checkBudget(page, { maxSizeKb: 400 });
  assert.equal(result.ok, false);
  assert.deepEqual(result.lines, [{ ok: false, label: 'size 450 kB ≤ 400 kB', over: '+50 kB' }]);
});

test('a grade worse than the minimum fails, a better one passes', () => {
  assert.equal(checkBudget(page, { minGrade: 'A' }).ok, false);
  assert.equal(checkBudget(page, { minGrade: 'C' }).ok, true);
});

test('an unknown key is an error, not a silently ignored limit', () => {
  assert.throws(() => checkBudget(page, { maxWeight: 10 }), /maxWeight/);
});

test('an empty budget checks nothing, and is refused', () => {
  assert.throws(() => checkBudget(page, {}), /empty/);
});
