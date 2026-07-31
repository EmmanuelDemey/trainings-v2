// src/bench.ts — compare the native addon `fib` against a pure-TS `fib`.
import { createRequire } from 'node:module';
import { performance } from 'node:perf_hooks';

interface Addon {
  hello(): string;
  fib(n: number): number;
}

const require = createRequire(import.meta.url);
const addon: Addon = require('../build/Release/addon.node');

// Pure-TS reference implementation (intentionally naive, like the C++ one).
function fibTs(n: number): number {
  return n < 2 ? n : fibTs(n - 1) + fibTs(n - 2);
}

const N = 40;

// TODO: benchmark the pure-TS version.
//   1. const startTs = performance.now();
//   2. const resultTs = fibTs(N);
//   3. const elapsedTs = performance.now() - startTs;
//   4. console.log(`TS    fib(${N}) = ${resultTs} in ${elapsedTs.toFixed(2)} ms`);

// TODO: benchmark the native addon version the same way using addon.fib(N),
//       then compute and log the speed-up ratio (elapsedTs / elapsedNative).
