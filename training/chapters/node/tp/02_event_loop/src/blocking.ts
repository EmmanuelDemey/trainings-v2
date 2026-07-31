// Step 3 — A CPU-bound workload to profile with the V8 sampling profiler.
//
//   npm run profile                       # node --prof src/blocking.ts
//   node --prof-process isolate-*.log     # turn the raw log into a readable report
//
// In the report, find which function dominates the "Bottom up (heavy) profile".

// TODO: implement a deliberately naive, recursive Fibonacci (no memoization)
// so that it burns CPU on the main thread.
function fib(n: number): number {
  // TODO: return fib(n - 1) + fib(n - 2) with the base case for n < 2
  return n;
}

export function run(): void {
  // TODO: call fib() in a loop with a large enough n (e.g. 38..40) so the
  // process runs long enough to produce meaningful samples, and log each result.
  console.log("blocking workload not implemented yet");
}

if (import.meta.main) {
  run();
}
