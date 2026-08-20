// Step 3 — A CPU-bound workload to profile with the V8 sampling profiler.
//
//   npm run profile                       # node --prof src/blocking.ts
//   node --prof-process isolate-*.log     # turn the raw log into a readable report
//
// In the report, `fib` dominates the "Bottom up (heavy) profile" and the
// "Summary" shows almost 100% of ticks in JavaScript — no GC pressure, no
// syscalls, just one function burning the main thread.

/**
 * Deliberately naive: no memoization, so the call tree is exponential and the
 * profiler has plenty of samples to attribute.
 */
function fib(n: number): number {
  if (n < 2) return n;
  return fib(n - 1) + fib(n - 2);
}

export function run(): void {
  // 32..34 already takes long enough to sample well; raise it if your report
  // comes out with only a handful of ticks.
  for (let n = 30; n <= 34; n++) {
    const started = performance.now();
    const value = fib(n);
    console.log(`fib(${n}) = ${value}  (${Math.round(performance.now() - started)} ms)`);
  }
}

if (import.meta.main) {
  run();
}
