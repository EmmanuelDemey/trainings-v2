// src/index.ts — typed loader for the compiled native addon.
import { createRequire } from 'node:module';

interface Addon {
  hello(): string;
  fib(n: number): number;
}

const require = createRequire(import.meta.url);
const addon: Addon = require('../build/Release/addon.node');

// TODO: call addon.hello() and log its result.

// TODO: once `fib` is implemented and exported in addon.cc,
//       call addon.fib(40) and log the result.
