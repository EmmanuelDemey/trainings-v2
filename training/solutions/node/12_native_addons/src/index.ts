// src/index.ts — typed loader for the compiled native addon.
//
// `createRequire` is how you load a `.node` binary from an ES module: there is
// no `import` form for native addons, and `require` is what dlopen()s it.
import { createRequire } from 'node:module';

interface Addon {
  hello(): string;
  fib(n: number): number;
}

const require = createRequire(import.meta.url);
const addon: Addon = require('../build/Release/addon.node');

console.log('addon.hello() ->', addon.hello());
console.log('addon.fib(40) ->', addon.fib(40));

// The argument checks written in C++, seen from JavaScript. The `Addon`
// interface above is a claim, not a guarantee: nothing stops a caller in plain
// JS from passing a string, which is exactly why the native side validates.
try {
  (addon as unknown as { fib(n: unknown): number }).fib('40');
} catch (error) {
  console.log('addon.fib("40") ->', (error as Error).message);
}

try {
  addon.fib(100);
} catch (error) {
  console.log('addon.fib(100) ->', (error as Error).message);
}
