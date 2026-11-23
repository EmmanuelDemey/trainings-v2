// node --test scripts/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ecoIndex } from './ecoindex.mjs';

test('a tiny page scores high, grade A', () => {
  const result = ecoIndex({ dom: 50, requests: 3, sizeKb: 100 });
  assert.ok(result.score > 80, String(result.score));
  assert.equal(result.grade, 'A');
});

test('the reference median page lands in the middle of the scale', () => {
  // The 10th quantile of every distribution: halfway through the scale.
  const result = ecoIndex({ dom: 603, requests: 78, sizeKb: 1448.32 });
  assert.equal(result.score, 50);
  assert.equal(result.grade, 'D');
  assert.equal(result.ghg, 2);
  assert.equal(result.water, 3);
});

test('a heavy page scores low, grade F or G', () => {
  const result = ecoIndex({ dom: 3000, requests: 300, sizeKb: 9000 });
  assert.ok(result.score < 25, String(result.score));
  assert.match(result.grade, /^[FG]$/);
});

test('the DOM weighs three times as much as the size', () => {
  const heavyDom = ecoIndex({ dom: 2479, requests: 2, sizeKb: 1.37 });
  const heavySize = ecoIndex({ dom: 47, requests: 2, sizeKb: 8037.54 });
  assert.ok(heavyDom.score < heavySize.score);
});

test('the score never leaves 0–100', () => {
  assert.ok(ecoIndex({ dom: 1e7, requests: 1e5, sizeKb: 1e7 }).score >= 0);
  assert.ok(ecoIndex({ dom: 0, requests: 0, sizeKb: 0 }).score <= 100);
});
