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

// Warm up so the TS side is measured JIT-compiled rather than in the
// interpreter. Without this the "speed-up" is mostly V8's tier-up latency, and
// the number you would report would be a lie in your favour.
fibTs(25);
addon.fib(25);

const startTs = performance.now();
const resultTs = fibTs(N);
const elapsedTs = performance.now() - startTs;
console.log(`TS      fib(${N}) = ${resultTs} in ${elapsedTs.toFixed(2)} ms`);

const startNative = performance.now();
const resultNative = addon.fib(N);
const elapsedNative = performance.now() - startNative;
console.log(`native  fib(${N}) = ${resultNative} in ${elapsedNative.toFixed(2)} ms`);

console.log(`\nspeed-up: ${(elapsedTs / elapsedNative).toFixed(2)}x`);
console.log(
  'Somewhere around 5-10x on this workload — deep recursion with a tiny body is\n' +
    'close to the best case for C++ and the worst case for V8 (every call is a\n' +
    'JS frame). Try the same benchmark on string manipulation or on anything that\n' +
    'crosses the boundary in a loop and the gap collapses, sometimes inverts: each\n' +
    'call has to marshal its arguments through Node-API.\n' +
    '\n' +
    'And the speed-up is not the price. The price is the build toolchain on every\n' +
    'developer machine, a prebuild per platform and per Node ABI, and a failure\n' +
    'mode that is a segfault rather than an exception. Reach for a native addon\n' +
    'when you need an existing C library or SIMD — not because "C++ is faster".',
);
